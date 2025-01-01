import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends HttpException {
    constructor() {
        super("User doesn't exist", HttpStatus.NOT_FOUND);
    }
}

export class InvalidCredentialsException extends HttpException {
    constructor() {
        super('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
}

export class PassportCannotBeTheSameException extends HttpException {
    constructor() {
        super('Passport cannot be the same', HttpStatus.BAD_REQUEST);
    }
}