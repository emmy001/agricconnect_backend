import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MarketplaceService } from './marketplace.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('marketplace')
@Controller('marketplace')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  // Products
  @Get('products')
  @ApiOperation({ summary: 'Get all products' })
  async getProducts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('sortBy') sortBy?: string,
  ) {
    return this.marketplaceService.getProducts({ page, limit, category, search, minPrice, maxPrice, sortBy });
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Get product by ID' })
  async getProduct(@Param('id') id: string) {
    return this.marketplaceService.getProduct(id);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all categories' })
  async getCategories() {
    return this.marketplaceService.getCategories();
  }

  // Cart
  @Get('cart')
  @ApiOperation({ summary: 'Get user cart' })
  async getCart(@CurrentUser() user: User) {
    return this.marketplaceService.getCart(user.id);
  }

  @Post('cart/add')
  @ApiOperation({ summary: 'Add item to cart' })
  async addToCart(
    @CurrentUser() user: User,
    @Body('productId') productId: string,
    @Body('quantity') quantity: number = 1,
  ) {
    return this.marketplaceService.addToCart(user.id, productId, quantity);
  }

  @Put('cart/update')
  @ApiOperation({ summary: 'Update cart item' })
  async updateCartItem(
    @CurrentUser() user: User,
    @Body('itemId') itemId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.marketplaceService.updateCartItem(user.id, itemId, quantity);
  }

  @Delete('cart/remove/:itemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  async removeFromCart(@CurrentUser() user: User, @Param('itemId') itemId: string) {
    return this.marketplaceService.removeFromCart(user.id, itemId);
  }

  @Delete('cart/clear')
  @ApiOperation({ summary: 'Clear cart' })
  async clearCart(@CurrentUser() user: User) {
    return this.marketplaceService.clearCart(user.id);
  }

  // Orders
  @Get('orders')
  @ApiOperation({ summary: 'Get user orders' })
  async getOrders(
    @CurrentUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: string,
  ) {
    return this.marketplaceService.getOrders(user.id, { page, limit, status });
  }

  @Post('orders')
  @ApiOperation({ summary: 'Create order' })
  async createOrder(
    @CurrentUser() user: User,
    @Body('shippingAddress') shippingAddress: any,
    @Body('paymentMethod') paymentMethod: string,
  ) {
    return this.marketplaceService.createOrder(user.id, shippingAddress, paymentMethod);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get order by ID' })
  async getOrder(@Param('id') id: string) {
    return this.marketplaceService.getOrder(id);
  }

  @Put('orders/:id/cancel')
  @ApiOperation({ summary: 'Cancel order' })
  async cancelOrder(@Param('id') id: string, @CurrentUser() user: User) {
    return this.marketplaceService.cancelOrder(id, user.id);
  }

  // Equipment
  @Get('equipment')
  @ApiOperation({ summary: 'Get all equipment' })
  async getEquipment(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('type') type?: string,
    @Query('search') search?: string,
    @Query('isAvailable') isAvailable?: boolean,
  ) {
    return this.marketplaceService.getEquipment({ page, limit, type, search, isAvailable });
  }

  @Get('equipment/:id')
  @ApiOperation({ summary: 'Get equipment by ID' })
  async getEquipmentById(@Param('id') id: string) {
    return this.marketplaceService.getEquipmentById(id);
  }

  @Post('equipment/:id/rent')
  @ApiOperation({ summary: 'Rent equipment' })
  async rentEquipment(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body('startDate') startDate: Date,
    @Body('endDate') endDate: Date,
    @Body('deliveryAddress') deliveryAddress?: string,
    @Body('notes') notes?: string,
  ) {
    return this.marketplaceService.rentEquipment(user.id, id, startDate, endDate, deliveryAddress, notes);
  }

  @Get('rentals')
  @ApiOperation({ summary: 'Get user rentals' })
  async getRentals(
    @CurrentUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: string,
  ) {
    return this.marketplaceService.getRentals(user.id, { page, limit, status });
  }
}