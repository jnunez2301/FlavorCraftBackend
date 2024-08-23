import { Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import jwtMiddleware from "../middleware/jwtMiddleware.ts";
import { apiError } from "../util/apiError.ts";
import recipeModel, { Recipe, RecipeResponseTypes } from "../model/Recipe.ts";
import verifyUserIntegrity from "../middleware/verifyUserIntegrity.ts";
import ApiResponse, { ResponseTypes } from "../model/ApiResponse.ts";
import { s3DeleteImg, s3StoreImg } from "../util/s3Client.ts";
import { PDFDocument } from "https://cdn.skypack.dev/pdf-lib@^1.17.1";

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
recipeRouter.get(
  "/api/recipes/:recipeId/user/:userId/pdf",
  jwtMiddleware,
  async (ctx, next) => {
    try {
      const { recipeId, userId } = ctx.params;
      const currentRecipe = (await recipeModel.findOne({
        _id: recipeId,
      })) as Recipe;
      if (!currentRecipe) {
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          message: RecipeResponseTypes.RECIPE_NOT_FOUND,
        } as ApiResponse;
        return;
      }
      if (!currentRecipe.publicRecipe) {
        const isUserIntegrityVerified = await verifyUserIntegrity(
          ctx,
          currentRecipe.userId + ""
        );
        if (!isUserIntegrityVerified) return;
      }
      const isSameUser = userId === currentRecipe.userId + "";
      if (!isSameUser) {
        ctx.response.status = 403;
        ctx.response.body = {
          success: false,
          message: ResponseTypes.NOT_AUTHORIZED,
        } as ApiResponse;
        return;
      }
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const pageHeight = page.getHeight();
      const pageWidth = page.getWidth();

      const marginTop = 50;
      let currentY = pageHeight - marginTop;
      const lineHeight = 20;
      let fontSize = 16; // Default font size

      // Calculate the total height needed
      let totalHeightNeeded = marginTop + 20 + lineHeight + 10; // Title height + extra space
      totalHeightNeeded += lineHeight * 6; // Description, category, typeOfCuisine, caloriesPerServing, servings, prepTime

      totalHeightNeeded += lineHeight + 10; // Extra space before ingredients section
      totalHeightNeeded +=
        lineHeight + lineHeight * currentRecipe.ingredients.length; // Ingredients

      totalHeightNeeded += lineHeight + 10; // Extra space before instructions section
      totalHeightNeeded += lineHeight * currentRecipe.instructions.length; // Instructions

      if (currentRecipe.sauceInstructions) {
        totalHeightNeeded +=
          10 + lineHeight * currentRecipe.sauceInstructions.length; // Sauce instructions
      }

      if (currentRecipe.sideDishesRecommendations) {
        totalHeightNeeded +=
          10 +
          lineHeight +
          lineHeight * currentRecipe.sideDishesRecommendations.length; // Side dishes
      }

      // Adjust the font size if necessary
      if (totalHeightNeeded > pageHeight) {
        fontSize = fontSize * (pageHeight / totalHeightNeeded);
        if (fontSize < 8) {
          fontSize = 8; // Minimum readable size
        }
      }

      const titleFontSize = fontSize + 4; // Title should be larger than the rest
      const infoFontSize = 11;

      page.drawText(currentRecipe.title, {
        x: pageWidth / 2 - 100,
        y: currentY,
        size: titleFontSize,
      });

      currentY -= lineHeight * (titleFontSize / 16) + 10; // Extra space after title
      page.drawText(currentRecipe.description, {
        x: 50,
        y: currentY,
        size: infoFontSize,
      });

      currentY -= lineHeight * (fontSize / 16);
      page.drawText(currentRecipe.category, {
        x: 50,
        y: currentY,
        size: infoFontSize,
      });

      currentY -= lineHeight * (fontSize / 16);
      page.drawText(currentRecipe.typeOfCuisine, {
        x: 50,
        y: currentY,
        size: infoFontSize,
      });

      currentY -= lineHeight * (fontSize / 16);
      page.drawText(`${currentRecipe.caloriesPerServing} kcal`, {
        x: 50,
        y: currentY,
        size: infoFontSize,
      });

      currentY -= lineHeight * (fontSize / 16);
      page.drawText(`${currentRecipe.servings} servings`, {
        x: 50,
        y: currentY,
        size: infoFontSize,
      });

      currentY -= lineHeight * (fontSize / 16);
      page.drawText(`${currentRecipe.prepTime} minutes`, {
        x: 50,
        y: currentY,
        size: infoFontSize,
      });

      currentY -= lineHeight * (fontSize / 16) + 10; // Extra space before ingredients section
      page.drawText("Ingredients", {
        x: 50,
        y: currentY,
        size: titleFontSize,
      });

      currentY -= lineHeight * (fontSize / 16);
      currentRecipe.ingredients.forEach((ingredient) => {
        page.drawText(ingredient, {
          x: 50,
          y: currentY,
          size: infoFontSize,
        });
        currentY -= lineHeight * (fontSize / 16);
      });

      currentY -= 10; // Extra space before instructions section
      page.drawText("Instructions", {
        x: 50,
        y: currentY,
        size: titleFontSize,
      });

      currentY -= lineHeight * (fontSize / 16);
      currentRecipe.instructions.forEach((instruction, index) => {
        page.drawText(`${index + 1}. ${instruction}`, {
          x: 50,
          y: currentY,
          size: infoFontSize,
        });
        currentY -= lineHeight * (fontSize / 16);
      });

      if (currentRecipe.sauceInstructions) {
        currentY -= 10; // Extra space before sauce instructions
        page.drawText("Sauce Instructions", {
          x: 50,
          y: currentY,
          size: titleFontSize,
        });
        currentY -= lineHeight * (fontSize / 16);
        currentRecipe.sauceInstructions.forEach((instruction, index) => {
          page.drawText(`Sauce ${index + 1}: ${instruction}`, {
            x: 50,
            y: currentY,
            size: infoFontSize,
          });
          currentY -= lineHeight * (fontSize / 16);
        });
      }

      if (currentRecipe.sideDishesRecommendations) {
        currentY -= 10; // Extra space before side dishes section
        page.drawText("Side Dishes Recommendations", {
          x: 50,
          y: currentY,
          size: titleFontSize,
        });

        currentY -= lineHeight * (fontSize / 16);
        currentRecipe.sideDishesRecommendations.forEach((sideDish) => {
          page.drawText(sideDish, {
            x: 50,
            y: currentY,
            size: infoFontSize,
          });
          currentY -= lineHeight * (fontSize / 16);
        });
      }

      const pdfBytes = await pdfDoc.save();
      ctx.response.status = 200;
      ctx.response.body = pdfBytes;
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
    const isUserIntegrityVerified = await verifyUserIntegrity(
      ctx,
      newRecipe.userId + ""
    );
    if (!isUserIntegrityVerified) return;
    if (
      newRecipe.backgroundImg &&
      newRecipe.backgroundImg.trim() !== "" &&
      newRecipe.backgroundImg !== newRecipe.backgroundImg
    ) {
      const fileUrl = await s3StoreImg(
        newRecipe.backgroundImg,
        `${newRecipe.title + newRecipe.userId}.jpg`
      );
      if (!fileUrl) {
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
      if (!currentRecipe) {
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
      if (
        updatedRecipe.backgroundImg &&
        updatedRecipe.backgroundImg.trim() !== "" &&
        updatedRecipe.backgroundImg !== currentRecipe.backgroundImg
      ) {
        const fileUrl = await s3StoreImg(
          updatedRecipe.backgroundImg,
          `${updatedRecipe.title + updatedRecipe.userId}.jpg`
        );
        if (!fileUrl) {
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
      if (recipe.backgroundImg) {
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
