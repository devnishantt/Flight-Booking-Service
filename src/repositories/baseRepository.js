import logger from "../config/loggerConfig.js";
import { AppError, NotFoundError } from "../utils/errors.js";

export class BaseRepository {
  constructor(model) {
    if (!model) throw new Error("Model is required for BaseRepository!");
    this.model = model;
  }

  async create(data) {
    try {
      const result = await this.model.create(data);
      return result;
    } catch (error) {
      logger.error(`Error creating ${this.model.name}: ${error.message}`);
      throw new AppError(`Failed to create ${this.model.name}!`, 500, error);
    }
  }

  async findById(id, options = {}) {
    try {
      const record = await this.model.findByPk(id, options);
      if (!record) {
        throw new NotFoundError(`${this.model.name} with ID: ${id} not found!`);
      }
      return record;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      logger.error(`Error finding ${this.model.name}: ${error.message}`);
      throw new AppError(`Failed to fetch ${this.model.name}`, 500, error);
    }
  }

  async findAll(options = {}) {
    try {
      const response = await this.model.findAll(options);

      return response;
    } catch (error) {
      logger.error(`Error fetching all ${this.model.name}: ${error.message}`);
      throw new AppError(`Failed to fetch ${this.model.name}`, 500, error);
    }
  }

  async findOne(where, options = {}) {
    try {
      const response = await this.model.findOne({ where, ...options });
      return response;
    } catch (error) {
      logger.error(`Error fetching ${this.model.name}:${error.message}`);
      throw new AppError(`Failed to fetch ${this.model.name}`, 500, error);
    }
  }

  async update(id, data, options = {}) {
    try {
      const response = await this.findById(id);
      const updated = await response.update(data, options);
      return updated;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      logger.error(`Error updating ${this.model.name}: ${error.message}`);
      throw new AppError(`Failed to update ${this.model.name}`, 500, error);
    }
  }

  async delete(id, options = {}) {
    try {
      const response = await this.findById(id);
      await response.destroy(options);
      return true;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      logger.error(`Error deleting ${this.model.name}: ${error.message}!`);
      throw new AppError(`Failed to delete ${this.model.name}`, 500, error);
    }
  }
}
