import { cartModel } from "../models/carts.model.js";
import { newMessage } from "../../utils.js";
export class CartManagerDB {
    async getCartById(id) {
        try {
            let cartFindId = await cartModel.findOne({ _id: id }).lean()
            if (cartFindId) {
                return newMessage("success", "Found successfully", cartFindId.products)
            } else {
                return newMessage("failure", "Cart not Found", "")
            }
        } catch (e) {
            console.log(e)
            return newMessage("failure", "A problem ocurred", "")
        }
    }
    async addCart() {
        try {
            await cartModel.create({ products: [] })
            const lastAdded = await cartModel.findOne({}).sort({ _id: -1 }).lean()
            return newMessage("success", "cart added successfully", lastAdded)
        } catch (e) {
            console.log(e)
            return newMessage("failure", "A problem ocurred", "")
        }
    }
    async addProduct(idCart, idProduct) {
        try {
            const listProducts = new ProductManagerDB()
            let cart = await cartModel.findOne({ _id: idCart }).lean()
            if (!cart) {
                return newMessage("failure", "cart not found", "")
            }
            let product = await listProducts.getProductById(idProduct)
            product = product.data
            if (!product) {
                return newMessage("failure", "product not found", "")
            }
            const productRepeated = cart.products.find(pro => pro.idProduct.toString() === product._id.toString())
            let messageReturn = {}
            if (productRepeated) {
                const positionProductRepeated = cart.products.indexOf(productRepeated)
                console.log(positionProductRepeated, cart.products[positionProductRepeated].quantity)
                if (cart.products[positionProductRepeated].quantity < product.stock) {
                    cart.products[positionProductRepeated].quantity++
                    messageReturn = newMessage("success", "Product repeated: quantity added correctly", cart)
                } else {
                    messageReturn = newMessage("failure", "Product repeated: quantity is iqual to the stock", cart)
                }
            } else {
                cart.products.push({ idProduct: product._id, quantity: 1 })
                messageReturn = newMessage("success", "Product added correctly", cart)
            }
            await cartModel.updateOne({ _id: cart._id }, cart)
            return messageReturn
        } catch (e) {
            console.log(e)
            return newMessage("failure", "A problem ocurred", "")
        }
    }
    async deleteProduct(idCart, idProduct) {
        try {
            const cartFindId = await cartModel.findOne({ _id: idCart }).lean()
            const cartProducts = cartFindId.products
            const positionProduct = cartFindId.products.indexOf(cartFindId.products.find(idPro => idPro === idProduct))
            cartProducts.splice(positionProduct, 1)
            await cartModel.updateOne({ _id: cartFindId._id }, cartFindId)
            return newMessage("succes", "product deleted", cartFindId)
        } catch (e) {
            console.log(e)
            throw new Error("A problem ocurred")
        }
    }
}