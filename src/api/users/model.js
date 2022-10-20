import mongoose from "mongoose"

const { Schema, model } = mongoose

const usersSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    age: { type: Number, required: true, min: 18, max: 65 },
    professions: [String],
    address: {
      street: { type: String },
      number: { type: Number },
    },
    purchaseHistory: [
      {
        title: String,
        category: String,
        asin: String,
        price: Number,
        purchaseDate: Date,
      },
    ],
  },
  {
    timestamps: true, // this option automatically handles createdAt and updatedAt fields
  }
)

export default model("User", usersSchema) // this model is now binded to the "users" collection, if the collection does not exist, mongoose will create it automagically
