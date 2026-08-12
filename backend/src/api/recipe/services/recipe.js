'use strict';

/**
 * recipe service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::recipe.recipe');
