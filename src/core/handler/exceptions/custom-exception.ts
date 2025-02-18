import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends HttpException {
    constructor() {
        super("User doesn't exist", HttpStatus.NOT_FOUND);
    }
}

export class UserAlreadyExistsException extends HttpException {
    constructor() {
        super('User already exists', HttpStatus.BAD_REQUEST);
    }
}

export class EmailNotFoundException extends HttpException {
    constructor() {
        super('Email not found', HttpStatus.NOT_FOUND);
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

export class InvalidTokenException extends HttpException {
    constructor() {
        super('Invalid token', HttpStatus.UNAUTHORIZED);
    }
}

export class ServiceUnavailableException extends HttpException {
    constructor() {
        super('Service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
}

export class ConnectionNotFoundException extends HttpException {
    constructor() {
        super('Connection not found', HttpStatus.NOT_FOUND);
    }
}

export class ConnectionIdIsRequiredException extends HttpException {
    constructor() {
        super('Connection ID is required', HttpStatus.BAD_REQUEST);
    }
}

export class ContainerWithUuidNotFoundException extends HttpException {
    constructor() {
        super('Container with uuid not found', HttpStatus.NOT_FOUND);
    }
}

export class ContainerUUIDNotFoundForGivenConnectionException extends HttpException {
    constructor() {
        super('Container with uuid not found for the given connection', HttpStatus.NOT_FOUND);
    }
}

export class ContainerWithUuidNotFoundException extends HttpException {
    constructor() {
        super('Container with uuid not found', HttpStatus.NOT_FOUND);
    }
}
