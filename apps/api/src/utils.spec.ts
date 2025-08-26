import { validateUuid } from './utils';
import { InvalidUUIDError } from './core/errors/InvalidUUID.error';

describe('validateUuid', () => {
  describe('valid UUIDs', () => {
    it('should not throw error for valid UUID v4', () => {
      // Arrange
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';

      // Act & Assert
      expect(() => validateUuid(validUuid)).not.toThrow();
    });

    it('should not throw error for valid UUID v1', () => {
      // Arrange
      const validUuidV1 = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

      // Act & Assert
      expect(() => validateUuid(validUuidV1)).not.toThrow();
    });

    it('should not throw error for valid UUID with uppercase letters', () => {
      // Arrange
      const validUuidUppercase = '550E8400-E29B-41D4-A716-446655440000';

      // Act & Assert
      expect(() => validateUuid(validUuidUppercase)).not.toThrow();
    });

    it('should not throw error for valid UUID with mixed case', () => {
      // Arrange
      const validUuidMixedCase = '550e8400-E29B-41d4-A716-446655440000';

      // Act & Assert
      expect(() => validateUuid(validUuidMixedCase)).not.toThrow();
    });
  });

  describe('invalid UUIDs', () => {
    it('should throw InvalidUUIDError for invalid UUID format', () => {
      // Arrange
      const invalidUuid = 'invalid-uuid-string';

      // Act & Assert
      expect(() => validateUuid(invalidUuid)).toThrow(InvalidUUIDError);
    });

    it('should throw InvalidUUIDError for UUID without hyphens', () => {
      // Arrange
      const uuidWithoutHyphens = '550e8400e29b41d4a716446655440000';

      // Act & Assert
      expect(() => validateUuid(uuidWithoutHyphens)).toThrow(InvalidUUIDError);
    });

    it('should throw InvalidUUIDError for UUID with wrong length', () => {
      // Arrange
      const shortUuid = '550e8400-e29b-41d4-a716';

      // Act & Assert
      expect(() => validateUuid(shortUuid)).toThrow(InvalidUUIDError);
    });

    it('should throw InvalidUUIDError for UUID with extra characters', () => {
      // Arrange
      const longUuid = '550e8400-e29b-41d4-a716-446655440000-extra';

      // Act & Assert
      expect(() => validateUuid(longUuid)).toThrow(InvalidUUIDError);
    });

    it('should throw InvalidUUIDError for UUID with invalid characters', () => {
      // Arrange
      const invalidCharUuid = '550e8400-e29b-41d4-a716-44665544000g';

      // Act & Assert
      expect(() => validateUuid(invalidCharUuid)).toThrow(InvalidUUIDError);
    });

    it('should throw InvalidUUIDError for completely random string', () => {
      // Arrange
      const randomString = 'this-is-not-a-uuid-at-all';

      // Act & Assert
      expect(() => validateUuid(randomString)).toThrow(InvalidUUIDError);
    });
  });

  describe('edge cases', () => {
    it('should throw InvalidUUIDError for empty string', () => {
      // Arrange
      const emptyString = '';

      // Act & Assert
      expect(() => validateUuid(emptyString)).toThrow(InvalidUUIDError);
    });

    it('should throw InvalidUUIDError for whitespace only string', () => {
      // Arrange
      const whitespaceString = '   ';

      // Act & Assert
      expect(() => validateUuid(whitespaceString)).toThrow(InvalidUUIDError);
    });

    it('should throw InvalidUUIDError for UUID with leading/trailing whitespace', () => {
      // Arrange
      const uuidWithWhitespace = ' 550e8400-e29b-41d4-a716-446655440000 ';

      // Act & Assert
      expect(() => validateUuid(uuidWithWhitespace)).toThrow(InvalidUUIDError);
    });

    it('should throw InvalidUUIDError for null-like string', () => {
      // Arrange
      const nullString = 'null';

      // Act & Assert
      expect(() => validateUuid(nullString)).toThrow(InvalidUUIDError);
    });

    it('should throw InvalidUUIDError for undefined-like string', () => {
      // Arrange
      const undefinedString = 'undefined';

      // Act & Assert
      expect(() => validateUuid(undefinedString)).toThrow(InvalidUUIDError);
    });

    it('should throw InvalidUUIDError for numeric string', () => {
      // Arrange
      const numericString = '12345';

      // Act & Assert
      expect(() => validateUuid(numericString)).toThrow(InvalidUUIDError);
    });
  });

  describe('error instance', () => {
    it('should throw error that is instance of Error', () => {
      // Arrange
      const invalidUuid = 'invalid';

      // Act & Assert
      expect(() => validateUuid(invalidUuid)).toThrow(Error);
    });

    it('should throw error that is specifically InvalidUUIDError', () => {
      // Arrange
      const invalidUuid = 'invalid';

      // Act & Assert
      try {
        validateUuid(invalidUuid);
        fail('Expected InvalidUUIDError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidUUIDError);
        expect(error).toBeInstanceOf(Error);
      }
    });
  });
});
