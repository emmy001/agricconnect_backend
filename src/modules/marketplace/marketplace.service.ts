import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Equipment } from './entities/equipment.entity';
import { EquipmentRental, RentalStatus } from './entities/equipment-rental.entity';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MarketplaceService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
    @InjectRepository(EquipmentRental)
    private rentalRepository: Repository<EquipmentRental>,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
  ) {}

  // Product Methods
  async getProducts(params: {
    page: number;
    limit: number;
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
  }): Promise<{ data: Product[]; total: number }> {
    const { page, limit, category, search, minPrice, maxPrice, sortBy } = params;
    const queryBuilder = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    if (category) {
      queryBuilder.andWhere('category.name = :category', { category });
    }

    if (search) {
      queryBuilder.andWhere('product.name ILIKE :search OR product.description ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
      queryBuilder.andWhere('product.price BETWEEN :minPrice AND :maxPrice', { minPrice, maxPrice });
    }

    // Sorting
    if (sortBy) {
      switch (sortBy) {
        case 'price_asc':
          queryBuilder.orderBy('product.price', 'ASC');
          break;
        case 'price_desc':
          queryBuilder.orderBy('product.price', 'DESC');
          break;
        case 'rating':
          queryBuilder.orderBy('product.rating', 'DESC');
          break;
        default:
          queryBuilder.orderBy('product.createdAt', 'DESC');
      }
    } else {
      queryBuilder.orderBy('product.createdAt', 'DESC');
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async getProduct(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async getCategories(): Promise<Category[]> {
    return this.categoryRepository.find();
  }

  // Cart Methods
  async getCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      cart = this.cartRepository.create({ userId, items: [] });
      await this.cartRepository.save(cart);
    }

    // Calculate subtotal
    cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    await this.cartRepository.save(cart);

    return cart;
  }

  async addToCart(userId: string, productId: string, quantity: number): Promise<Cart> {
    const product = await this.getProduct(productId);
    if (!product.inStock) {
      throw new BadRequestException('Product is out of stock');
    }

    const cart = await this.getCart(userId);
    
    let cartItem = cart.items.find(item => item.productId === productId);
    if (cartItem) {
      cartItem.quantity += quantity;
      await this.cartItemRepository.save(cartItem);
    } else {
      cartItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId,
        quantity,
        price: product.price,
      });
      await this.cartItemRepository.save(cartItem);
    }

    return this.getCart(userId);
  }

  async updateCartItem(userId: string, itemId: string, quantity: number): Promise<Cart> {
    const cart = await this.getCart(userId);
    const cartItem = cart.items.find(item => item.id === itemId);
    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    if (quantity <= 0) {
      await this.cartItemRepository.delete(itemId);
    } else {
      cartItem.quantity = quantity;
      await this.cartItemRepository.save(cartItem);
    }

    return this.getCart(userId);
  }

  async removeFromCart(userId: string, itemId: string): Promise<Cart> {
    const cart = await this.getCart(userId);
    const cartItem = cart.items.find(item => item.id === itemId);
    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartItemRepository.delete(itemId);
    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<{ success: boolean }> {
    const cart = await this.getCart(userId);
    await this.cartItemRepository.delete({ cartId: cart.id });
    return { success: true };
  }

  // Order Methods
  async createOrder(userId: string, shippingAddress: any, paymentMethod: string): Promise<Order> {
    const cart = await this.getCart(userId);
    if (cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Calculate totals
    const subtotal = cart.subtotal;
    const deliveryFee = subtotal > 1000 ? 0 : 150;
    const discount = subtotal > 5000 ? subtotal * 0.1 : 0;
    const tax = (subtotal - discount) * 0.16;
    const total = subtotal + deliveryFee - discount + tax;

    // Create order
    const order = this.orderRepository.create({
      userId,
      subtotal,
      deliveryFee,
      discount,
      tax,
      total,
      shippingAddress,
      paymentMethod,
      status: OrderStatus.PENDING,
    });

    const savedOrder = await this.orderRepository.save(order);

    // Create order items
    for (const cartItem of cart.items) {
      const orderItem = this.orderItemRepository.create({
        orderId: savedOrder.id,
        productId: cartItem.productId,
        productName: cartItem.product.name,
        price: cartItem.price,
        quantity: cartItem.quantity,
        total: cartItem.price * cartItem.quantity,
      });
      await this.orderItemRepository.save(orderItem);
    }

    // Clear cart
    await this.clearCart(userId);

    // Send notification
    await this.notificationsService.create({
      userId,
      title: 'Order Confirmed',
      body: `Your order #${savedOrder.id.slice(0, 8)} has been confirmed`,
      type: 'system',
      priority: 'high',
      data: { orderId: savedOrder.id },
    });

    return savedOrder;
  }

  async getOrders(userId: string, params: { page: number; limit: number; status?: string }): Promise<{ data: Order[]; total: number }> {
    const { page, limit, status } = params;
    const queryBuilder = this.orderRepository.createQueryBuilder('order')
      .where('order.userId = :userId', { userId });

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('order.createdAt', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async getOrder(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'items.product'],
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async cancelOrder(id: string, userId: string): Promise<Order> {
    const order = await this.getOrder(id);
    if (order.userId !== userId) {
      throw new BadRequestException('You can only cancel your own orders');
    }

    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.PROCESSING) {
      throw new BadRequestException('Cannot cancel order at this stage');
    }

    order.status = OrderStatus.CANCELLED;
    return this.orderRepository.save(order);
  }

  // Equipment Methods
  async getEquipment(params: {
    page: number;
    limit: number;
    type?: string;
    search?: string;
    isAvailable?: boolean;
  }): Promise<{ data: Equipment[]; total: number }> {
    const { page, limit, type, search, isAvailable } = params;
    const queryBuilder = this.equipmentRepository.createQueryBuilder('equipment');

    if (type) {
      queryBuilder.andWhere('equipment.type = :type', { type });
    }

    if (search) {
      queryBuilder.andWhere('equipment.name ILIKE :search', { search: `%${search}%` });
    }

    if (isAvailable !== undefined) {
      queryBuilder.andWhere('equipment.isAvailable = :isAvailable', { isAvailable });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('equipment.createdAt', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async getEquipmentById(id: string): Promise<Equipment> {
    const equipment = await this.equipmentRepository.findOne({ where: { id } });
    if (!equipment) {
      throw new NotFoundException('Equipment not found');
    }
    return equipment;
  }

  async rentEquipment(
    userId: string,
    equipmentId: string,
    startDate: Date,
    endDate: Date,
    deliveryAddress?: string,
    notes?: string,
  ): Promise<EquipmentRental> {
    const equipment = await this.getEquipmentById(equipmentId);
    if (!equipment.isAvailable) {
      throw new BadRequestException('Equipment is not available');
    }

    if (startDate >= endDate) {
      throw new BadRequestException('End date must be after start date');
    }

    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = equipment.pricePerDay * days;

    const rental = this.rentalRepository.create({
      userId,
      equipmentId,
      startDate,
      endDate,
      totalPrice,
      deliveryAddress,
      notes,
      status: RentalStatus.PENDING,
    });

    const savedRental = await this.rentalRepository.save(rental);

    // Mark equipment as unavailable
    equipment.isAvailable = false;
    await this.equipmentRepository.save(equipment);

    return savedRental;
  }

  async getRentals(userId: string, params: { page: number; limit: number; status?: string }): Promise<{ data: EquipmentRental[]; total: number }> {
    const { page, limit, status } = params;
    const queryBuilder = this.rentalRepository.createQueryBuilder('rental')
      .where('rental.userId = :userId', { userId });

    if (status) {
      queryBuilder.andWhere('rental.status = :status', { status });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('rental.createdAt', 'DESC')
      .getManyAndCount();

    return { data, total };
  }
}