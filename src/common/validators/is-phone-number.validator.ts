// src/common/validators/is-phone-number.validator.ts
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'isPhoneNumber', async: false })
export class IsPhoneNumberValidator implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(text);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Phone number ($value) is not valid';
  }
}