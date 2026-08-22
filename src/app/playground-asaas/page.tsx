"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  createCustomer,
  createPayment,
  getCustomerByCpf,
} from "@/lib/actions/asaas";
import { customerInfo, paymentInfo } from "@/app/playground-asaas/mockData";

export default function CreditCardPaymentForm() {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Attempt to find the customer by CPF
      let customer = await getCustomerByCpf("24971563792");

      // If the customer does not exist, create a new one
      if (!customer) {
        console.log("Customer not exists, creating...");
        alert("Customer not exists, creating...");
        customer = await createCustomer(customerInfo);
        console.log({ customer });
        alert("Customer created successfully!");
      } else {
        console.log({ customer });
        alert("Customer retrieved successfully!");
      }

      // Proceed to create a payment using the customer's ID
      const payment = await createPayment(paymentInfo, customer.id);
      console.log({ payment });
      alert(payment.status ?? payment.description);
    } catch (error) {
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 flex min-h-screen flex-col items-center justify-center rounded-md bg-background p-6 shadow">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="cardNumber"
            className="block text-lg font-medium text-gray-700"
          >
            Card Number
          </label>
          <input
            type="text"
            id="cardNumber"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg"
          />
        </div>
        <div>
          <label
            htmlFor="expiryDate"
            className="block text-lg font-medium text-gray-700"
          >
            Expiry Date
          </label>
          <input
            type="text"
            id="expiryDate"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg"
          />
        </div>
        <div>
          <label
            htmlFor="cvv"
            className="block text-lg font-medium text-gray-700"
          >
            CVV
          </label>
          <input
            type="text"
            id="cvv"
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg"
          />
        </div>
        <Button type="submit" disabled={loading} className="mt-4 w-full">
          {loading ? "Processing..." : "Pay"}
        </Button>
      </form>
    </div>
  );
}
