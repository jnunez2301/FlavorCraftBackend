import { Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import jwtMiddleware from "../middleware/jwtMiddleware.ts";
import { apiError } from "../util/apiError.ts";
import recipeModel, { Recipe, RecipeResponseTypes } from '../model/Recipe.ts';
import verifyUserIntegrity from "../middleware/verifyUserIntegrity.ts";
import ApiResponse from "../model/ApiResponse.ts";
const recipeRouter = new Router();

recipeRouter.get("/api/recipes/:userId", jwtMiddleware, async(ctx, next) => {
  try {
    const { userId } = ctx.params;
    const isUserIntegrityVerified = await verifyUserIntegrity(ctx, userId);
    if (!isUserIntegrityVerified) return;
    const recipes = await recipeModel.find({ userId });
    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: recipes,
    } as ApiResponse;
  } catch (error) {
    apiError(ctx, error);
  }
  await next();
})

recipeRouter.get("/api/recipes/:recipeId/user/:userId", jwtMiddleware, async(ctx, next) => {
  try {
    const { recipeId, userId } = ctx.params;
    const recipe = await recipeModel.findOne({ _id: recipeId });
    if(!recipe) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: RecipeResponseTypes.RECIPE_NOT_FOUND,
      } as ApiResponse;
      return;
    }
    const isUserIntegrityVerified = await verifyUserIntegrity(ctx, userId);
    if (!isUserIntegrityVerified) return;
    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: recipe,
    } as ApiResponse;
  } catch (error) {
    apiError(ctx, error);
  }
  await next();
})

recipeRouter.post("/api/recipes", jwtMiddleware, async(ctx, next) => {
  try {
    const newRecipe = await ctx.request.body.json() as Recipe;
    if(!newRecipe) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: RecipeResponseTypes.REQUEST_IS_EMPTY,
      } as ApiResponse;
      return;
    }
    const isUserIntegrityVerified = await verifyUserIntegrity(ctx, newRecipe.userId+'');
    if (!isUserIntegrityVerified) return;
    await recipeModel.create(newRecipe);
    ctx.response.status = 201;
    ctx.response.body = {
      success: true,
      message: RecipeResponseTypes.RECIPE_CREATED,
    } as ApiResponse;

  } catch (error) {
    apiError(ctx, error);
  }
  await next();
});

recipeRouter.put("/api/recipes/:recipeId/user/:userId", jwtMiddleware, async(ctx, next) => {
  try {
    const { recipeId, userId } = ctx.params;
    const updatedRecipe = await ctx.request.body.json() as Recipe;
    if(!updatedRecipe) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: RecipeResponseTypes.REQUEST_IS_EMPTY,
      } as ApiResponse;
      return;
    }
    const isUserIntegrityVerified = await verifyUserIntegrity(ctx, userId);
    if (!isUserIntegrityVerified) return;
    await recipeModel.updateOne({ _id: recipeId }, updatedRecipe);
    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: RecipeResponseTypes.RECIPE_UPDATED,
    } as ApiResponse;
  } catch (error) {
    apiError(ctx, error);
  }
  await next();
});

recipeRouter.delete("/api/recipes/:recipeId/user/:userId", jwtMiddleware, async(ctx, next) => {
  try {
    const { recipeId, userId } = ctx.params;
    const recipe = await recipeModel.findOne({ _id: recipeId });
    if(!recipe) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: RecipeResponseTypes.RECIPE_NOT_FOUND,
      } as ApiResponse;
      return;
    }
    const isUserIntegrityVerified = await verifyUserIntegrity(ctx, userId);
    if (!isUserIntegrityVerified) return;
    await recipeModel.deleteOne({ _id: recipeId });
    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: RecipeResponseTypes.RECIPE_DELETED,
    } as ApiResponse;
  } catch (error) {
    apiError(ctx, error);
  }
  await next();
});

export default recipeRouter;