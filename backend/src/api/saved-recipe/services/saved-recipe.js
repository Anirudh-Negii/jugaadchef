'use strict';

/**
 * saved-recipe service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::saved-recipe.saved-recipe');
