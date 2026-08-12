'use strict';

/**
 * recipe router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::recipe.recipe');
