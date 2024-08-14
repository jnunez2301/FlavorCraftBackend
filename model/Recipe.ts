import mongoose from "npm:mongoose";
import { ObjectId } from "https://deno.land/x/mongo@v0.33.0/deps.ts";

export type Recipe = {
  _id?: ObjectId;
  userId: ObjectId;
  title: string;
  description: string;
  category: string;
  typeOfCousine: string;
  caloriesPerServing: number;
  servings: number;
  prepTime: number;
  ingredients: string[];
  sauceInstructions?: string[];
  instructions: string[];
  sideDishesReeccomendations?: string[];
  backgroundImg?: string;
};
export enum RecipeResponseTypes {
  RECIPE_CREATED = "Recipe created successfully",
  RECIPE_UPDATED = "Recipe updated successfully",
  REQUEST_IS_EMPTY = "No recipe provided",
  RECIPE_NOT_FOUND = "Recipe not found",
  RECIPE_DELETED = "Recipe deleted successfully",
}

const recipeSchema = new mongoose.Schema<Recipe>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      minlength: 3,
    },
    description: {
      type: String,
      required: true,
      minlength: 3,
    },
    category: {
      type: String,
      required: true,
      minlength: 3,
    },
    typeOfCousine: {
      type: String,
      required: true,
      minlength: 3,
    },
    caloriesPerServing: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      max: 3000,
    },
    servings: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      max: 100,
    },
    prepTime: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      max: 3600,
    },
    ingredients: {
      type: [String],
      required: true,
      minlength: 1,
    },
    sauceInstructions: {
      type: [String],
      required: false,
      minlength: 1,
    },
    instructions: {
      type: [String],
      required: true,
      minlength: 1,
    },
    sideDishesReeccomendations: {
      type: [String],
      required: false,
      minlength: 1,
    },
    backgroundImg: {
      type: String,
      required: false,
      default: "",
    },
  },
  { timestamps: true }
);

const recipeModel = mongoose.model<Recipe>("Recipe", recipeSchema);

export default recipeModel;
