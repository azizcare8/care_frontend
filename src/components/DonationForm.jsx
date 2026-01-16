"use client";
import { useState } from "react";

export default function DonationForm() {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardType, setCardType] = useState("");

  return (
    <section className="max-w-5xl mx-auto p-6 bg-gradient-to-br from-green-50 to-white shadow-xl rounded-2xl">
      <form className="space-y-10">

        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-800">Your Donation</h2>
          <input
            type="text"
            placeholder="Enter Donation Amount"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-400 outline-none transition"
          />
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-800">Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-400 outline-none transition"
            />
            <input
              type="text"
              placeholder="Last Name"
              className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-400 outline-none transition"
            />
            <input
              type="email"
              placeholder="Email"
              className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-400 outline-none transition"
            />
            <input
              type="text"
              placeholder="Address"
              className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-400 outline-none transition"
            />
          </div>
          <textarea
            placeholder="Message (optional)"
            className="w-full border border-gray-300 rounded-lg p-3 h-28 focus:ring-2 focus:ring-green-400 outline-none transition"
          ></textarea>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-800">Choose Your Payment Method</h2>
          <div className="flex gap-6 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === "card"}
                onChange={() => setPaymentMethod("card")}
                className="accent-green-500"
              />
              <span className="font-medium">Payment By Card</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="offline"
                checked={paymentMethod === "offline"}
                onChange={() => setPaymentMethod("offline")}
                className="accent-green-500"
              />
              <span className="font-medium">Offline Donation</span>
            </label>
          </div>

          {paymentMethod === "card" && (
            <div className="pt-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Select Card Type</h3>
              <div className="flex gap-4 flex-wrap">
                {[
                  { id: "visa", img: "/visa.png", label: "Visa" },
                  { id: "mastercard", img: "/mastercard.png", label: "MasterCard" },
                  { id: "skrill", img: "/skrill.png", label: "Skrill" },
                  { id: "paypal", img: "/paypal.png", label: "PayPal" },
                ].map((card) => (
                  <label
                    key={card.id}
                    className={`border rounded-xl p-3 cursor-pointer hover:border-green-400 transition ${
                      cardType === card.id ? "border-green-500 bg-green-50" : "border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="cardType"
                      value={card.id}
                      checked={cardType === card.id}
                      onChange={() => setCardType(card.id)}
                      className="hidden"
                    />
                    <img src={card.img} alt={card.label} className="h-10 mx-auto" />
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-6 text-center">
          <button
            type="submit"
            className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-green-600 text-white font-bold px-8 py-3 rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition transform"
          >
            Donate Now
          </button>
        </div>
      </form>
    </section>
  );
}


