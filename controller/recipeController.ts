import { Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import jwtMiddleware from "../middleware/jwtMiddleware.ts";
import { apiError } from "../util/apiError.ts";
import recipeModel, { Recipe, RecipeResponseTypes } from "../model/Recipe.ts";
import verifyUserIntegrity from "../middleware/verifyUserIntegrity.ts";
import ApiResponse, { ResponseTypes } from "../model/ApiResponse.ts";
import { s3DeleteImg, s3StoreImg } from "../util/s3Client.ts";
const recipeRouter = new Router();

recipeRouter.get("/api/recipes/:userId", jwtMiddleware, async (ctx, next) => {
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
});

recipeRouter.get(
  "/api/recipes/:recipeId/user/:userId",
  jwtMiddleware,
  async (ctx, next) => {
    try {
      const { recipeId, userId } = ctx.params;
      const recipe = await recipeModel.findOne({ _id: recipeId });
      if (!recipe) {
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          message: RecipeResponseTypes.RECIPE_NOT_FOUND,
        } as ApiResponse;
        return;
      }
      if (recipe.publicRecipe === true) {
        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          message: recipe,
        } as ApiResponse;
        return;
      }
      const isUserIntegrityVerified = await verifyUserIntegrity(
        ctx,
        recipe.userId + ""
      );
      if (!isUserIntegrityVerified) return;
      const isSameUser = userId === recipe.userId + "";
      if (!isSameUser) {
        ctx.response.status = 403;
        ctx.response.body = {
          success: false,
          message: ResponseTypes.NOT_AUTHORIZED,
        } as ApiResponse;
        return;
      }
      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        message: recipe,
      } as ApiResponse;
    } catch (error) {
      apiError(ctx, error);
    }
    await next();
  }
);

recipeRouter.post("/api/recipes", jwtMiddleware, async (ctx, next) => {
  try {
    const newRecipe = (await ctx.request.body.json()) as Recipe;
    if (!newRecipe) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: RecipeResponseTypes.REQUEST_IS_EMPTY,
      } as ApiResponse;
      return;
    }
    const isUserIntegrityVerified = await verifyUserIntegrity(ctx,newRecipe.userId + "");
    if (!isUserIntegrityVerified) return;
    if(newRecipe.backgroundImg){
      const fileUrl = await s3StoreImg(newRecipe.backgroundImg, `${newRecipe.title + newRecipe.userId}.jpg`);
      if(!fileUrl){
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: ResponseTypes.IMAGE_UPLOAD_FAILED,
        } as ApiResponse;
        return;
      }
      newRecipe.backgroundImg = fileUrl;
    }
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

recipeRouter.put(
  "/api/recipes/:recipeId/user/:userId",
  jwtMiddleware,
  async (ctx, next) => {
    try {
      const { recipeId, userId } = ctx.params;
      const updatedRecipe = (await ctx.request.body.json()) as Recipe;
      if (!updatedRecipe) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: RecipeResponseTypes.REQUEST_IS_EMPTY,
        } as ApiResponse;
        return;
      }
      const currentRecipe = await recipeModel.findOne({ _id: recipeId });
      if(!currentRecipe) {
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          message: RecipeResponseTypes.RECIPE_NOT_FOUND,
        } as ApiResponse;
        return;
      }
      const isUserIntegrityVerified = await verifyUserIntegrity(
        ctx,
        currentRecipe.userId
      );
      if (!isUserIntegrityVerified) return;
      const isSameUser = userId === currentRecipe.userId + "";
      if (!isSameUser) {
        ctx.response.status = 403;
        ctx.response.body = {
          success: false,
          message: ResponseTypes.NOT_AUTHORIZED,
        } as ApiResponse;
        return;
      }
      if(updatedRecipe.backgroundImg){
        const fileUrl = await s3StoreImg(updatedRecipe.backgroundImg, `${updatedRecipe.title + updatedRecipe.userId}.jpg`);
        if(!fileUrl){
          ctx.response.status = 500;
          ctx.response.body = {
            success: false,
            message: ResponseTypes.IMAGE_UPLOAD_FAILED,
          } as ApiResponse;
          return;
        }
        updatedRecipe.backgroundImg = fileUrl;
      }
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
  }
);

recipeRouter.delete(
  "/api/recipes/:recipeId/user/:userId",
  jwtMiddleware,
  async (ctx, next) => {
    try {
      const { recipeId, userId } = ctx.params;
      const recipe = await recipeModel.findOne({ _id: recipeId });
      if (!recipe) {
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          message: RecipeResponseTypes.RECIPE_NOT_FOUND,
        } as ApiResponse;
        return;
      }
      const isUserIntegrityVerified = await verifyUserIntegrity(
        ctx,
        recipe.userId + ""
      );
      if (!isUserIntegrityVerified) return;
      const isSameUser = userId === recipe.userId + "";
      if (!isSameUser) {
        ctx.response.status = 403;
        ctx.response.body = {
          success: false,
          message: ResponseTypes.NOT_AUTHORIZED,
        } as ApiResponse;
        return;
      }
      if(recipe.backgroundImg){
        const fileName = `${recipe.title + recipe.userId}.jpg`;
        await s3DeleteImg(fileName);
      }
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
  }
);

export default recipeRouter;
