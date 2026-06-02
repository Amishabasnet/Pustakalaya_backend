const router      = require("express").Router();
const searchCtrl  = require("../controllers/search.controller");
const { protect, optionalAuth } = require("../middlewares/auth.middleware");
const { searchLimiter }         = require("../middlewares/rateLimiter.middleware");

// Public (search saves history if token present)
router.get("/",                   searchLimiter, optionalAuth, searchCtrl.search.bind(searchCtrl));
router.get("/popular",            searchLimiter, searchCtrl.getPopular.bind(searchCtrl));
router.get("/new-released",       searchLimiter, searchCtrl.getNewReleased.bind(searchCtrl));
router.get("/on-sale",            searchLimiter, searchCtrl.getOnSale.bind(searchCtrl));
router.get("/filter-options",                    searchCtrl.getFilterOptions.bind(searchCtrl));
router.get("/highly-recommended",                searchCtrl.getHighlyRecommended.bind(searchCtrl));

// Auth-protected search history
router.get   ("/recent",                protect, searchCtrl.getRecentSearches.bind(searchCtrl));
router.delete("/recent",                protect, searchCtrl.clearRecentSearches.bind(searchCtrl));
router.delete("/recent/:query",         protect, searchCtrl.removeRecentSearch.bind(searchCtrl));

module.exports = router;
