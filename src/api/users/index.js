import express from "express"
import createHttpError from "http-errors"
import UsersModel from "./model.js"
import BooksModel from "../books/model.js"

const usersRouter = express.Router()

usersRouter.post("/", async (req, res, next) => {
  try {
    const newUser = new UsersModel(req.body) // here it happens validation (thanks to Mongoose) of req.body, if it is not ok Mongoose will throw an error
    const { _id } = await newUser.save()
    res.status(201).send({ _id })
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/", async (req, res, next) => {
  try {
    const users = await UsersModel.find({}, { firstName: 1 })
    res.send(users)
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/:userId", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId)
    if (user) {
      res.send(user)
    } else {
      next(createHttpError(404, `User with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.put("/:userId", async (req, res, next) => {
  try {
    const updatedUser = await UsersModel.findByIdAndUpdate(
      req.params.userId, // WHO you want to modify
      req.body, // HOW you want to modify
      { new: true, runValidators: true } // OPTIONS. By default findByIdAndUpdate returns the record PRE-MODIFICATION. If you want to get back the updated object --> new:true
      // By default validation is off here --> runValidators: true
    )

    // ******************************************************** ALTERNATIVE METHOD **************************************************
    /*     const user = await UsersModel.findById(req.params.userId) // When you do a findById, findOne, etc,... you get back not a PLAIN JS OBJECT but you obtain a MONGOOSE DOCUMENT which is an object with some superpowers

    user.firstName = "George"

    await user.save()
    res.send(user) */
    if (updatedUser) {
      res.send(updatedUser)
    } else {
      next(createHttpError(404, `User with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.delete("/:userId", async (req, res, next) => {
  try {
    const deletedUser = await UsersModel.findByIdAndDelete(req.params.userId)
    if (deletedUser) {
      res.status(204).send()
    } else {
      next(createHttpError(404, `User with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

// ************************************************ EMBEDDED EXAMPLE **********************************************************

usersRouter.post("/:userId/purchaseHistory", async (req, res, next) => {
  try {
    // We gonna receive a bookId in the req.body. Given that Id, we would like to insert the corresponding book into the purchaseHistory array

    // 1. Find the book in the books' collection by id
    const purchasedBook = await BooksModel.findById(req.body.bookId, { _id: 0 }) // here we could use projection {_id: 0} to remove the _id from the book. We should do this because in this way Mongo will automagically create a unique _id for every item in the array

    if (purchasedBook) {
      // 2. If the books is found --> add additional info like purchaseDate
      const bookToInsert = {
        ...purchasedBook.toObject(),
        purchaseDate: new Date(),
      } // purchasedBook (and EVERYTHING you get from .find .findById,... is a MONGOOSE DOCUMENT, therefore to spread it I shall convert it into a plain object)

      console.log("BOOK TO INSERT: ", bookToInsert)

      // 3. Update the specified user by adding that book to his/her purchaseHistory array
      const updatedUser = await UsersModel.findByIdAndUpdate(
        req.params.userId, // WHO
        { $push: { purchaseHistory: bookToInsert } }, // HOW
        { new: true, runValidators: true } // OPTIONS
      )
      if (updatedUser) {
        res.send(updatedUser)
      } else {
        next(
          createHttpError(404, `User with id ${req.params.userId} not found!`)
        )
      }
    } else {
      // 4. In case of book or user not found --> 404
      next(createHttpError(404, `Book with id ${req.body.bookId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/:userId/purchaseHistory", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId)
    if (user) {
      res.send(user.purchaseHistory)
    } else {
      next(createHttpError(404, `User with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.get(
  "/:userId/purchaseHistory/:productId",
  async (req, res, next) => {
    try {
      const user = await UsersModel.findById(req.params.userId)
      if (user) {
        const purchasedBook = user.purchaseHistory.find(
          book => book._id.toString() === req.params.productId // You CANNOT compare a string(req.params.productId) with an ObjectId (book._id) --> you have to either convert _id into string or productId into ObjectId
        )
        console.log(user.purchaseHistory)
        if (purchasedBook) {
          res.send(purchasedBook)
        } else {
          next(
            createHttpError(404, `Book with id ${req.body.bookId} not found!`)
          )
        }
      } else {
        next(
          createHttpError(404, `User with id ${req.params.userId} not found!`)
        )
      }
    } catch (error) {
      next(error)
    }
  }
)

usersRouter.put(
  "/:userId/purchaseHistory/:productId",
  async (req, res, next) => {
    try {
      // 1. Find user by id (obtaining a MONGOOSE DOCUMENT)
      const user = await UsersModel.findById(req.params.userId)

      if (user) {
        // 2. Update the item in the array by using normal JS Code
        // 2.1 Search for the index of the product into the purchaseHistory array
        const index = user.purchaseHistory.findIndex(
          book => book._id.toString() === req.params.productId
        )

        if (index !== -1) {
          console.log({ ...user.purchaseHistory[index] })
          // 2.2 Modify that product
          user.purchaseHistory[index] = {
            ...user.purchaseHistory[index].toObject(), // <-- THIS IS A SUBDOCUMENT (has a lot of strange properties), to spread it we have to first use .toObject()
            ...req.body,
          }

          // 3. Since user object is a MONGOOSE DOCUMENT I can use .save() method to update that record
          await user.save()
          res.send(user)
        } else {
          next(
            createHttpError(404, `Book with id ${req.body.bookId} not found!`)
          )
        }
      } else {
        next(
          createHttpError(404, `User with id ${req.params.userId} not found!`)
        )
      }
    } catch (error) {
      next(error)
    }
  }
)

usersRouter.delete(
  "/:userId/purchaseHistory/:productId",
  async (req, res, next) => {
    try {
      const updatedUser = await UsersModel.findByIdAndUpdate(
        req.params.userId, // WHO
        { $pull: { purchaseHistory: { _id: req.params.productId } } }, // HOW
        { new: true } // OPTIONS
      )
      if (updatedUser) {
        res.send(updatedUser)
      } else {
        next(
          createHttpError(404, `User with id ${req.params.userId} not found!`)
        )
      }
    } catch (error) {
      next(error)
    }
  }
)

export default usersRouter
