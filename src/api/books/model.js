import mongoose from "mongoose"

const { Schema, model } = mongoose

const booksSchema = new Schema(
  {
    asin: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    category: {
      type: String,
      required: true,
      enum: ["history", "fantasy", "romance", "horror"],
    },
    img: { type: String, required: true },
    authors: [{ type: Schema.Types.ObjectId, ref: "Author" }],
  },
  { timestamps: true }
)

// ********************************************************* MONGOOSE CUSTOM METHOD **************************************************************

booksSchema.static("findBooksWithAuthors", async function (query) {
  const total = await this.countDocuments(query.criteria)

  const books = await this.find(query.criteria, query.options.fields)
    .skip(query.options.skip)
    .limit(query.options.limit)
    .sort(query.options.sort)
    .populate({
      path: "authors",
      select: "firstName lastName",
    })

  return { total, books }
})

export default model("Book", booksSchema)
