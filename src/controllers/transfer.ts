import express, { Request, Response, NextFunction } from "express";
import Beneficiary from "../model/beneficiary";
import Investment from "../model/investment";
import User from "../model/user";
import Transfers, { TRANSFER } from "../model/transfer";
import { timeStamp } from "console";
import { v4 } from "uuid";
import { Sequelize } from "sequelize";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const transferToBeneficiary = async (
  req: Request,
  res: Response,
  NextFunction: NextFunction
) => {
  try {
    const token: any = req.headers.authorization;
    const token_info = token.split(" ")[1];
    const decodedToken: any = jwt.verify(token_info, process.env.APP_SECRET!);

    const {
      accountNumber,
      amount,
      transfer_purpose,
      beneficiary_name,
      beneficiary_email,
      payer_reference,
      information_for_beneficiary,
    } = req.body;
    const validated_Beneficiary: any = await User.findOne({
      where: { accountNumber },
    });

    if (decodedToken.email) {
      if (validated_Beneficiary) {
        const beneficiary_AccountNumber = validated_Beneficiary.accountNumber;

        const sender_id = decodedToken.id;
        const sender_accountDetails: any = await User.findOne({
          where: { id: sender_id },
        });
        const sender_AccountBalance = sender_accountDetails.accountBalance;
        const sender_accountNumber = sender_accountDetails.accountNumber;

        if (
          +sender_accountNumber !== +beneficiary_AccountNumber &&
          +beneficiary_AccountNumber === +accountNumber
        ) {
          if (sender_AccountBalance >= +amount) {
            const sucessful_transfer = await Transfers.create({
              id: v4(),
              accountNumber,
              amount,
              transfer_purpose,
              beneficiary_name,
              beneficiary_email,
              payer_reference,
              information_for_beneficiary,
              status: "SUCCESSFUL",
              senderId: sender_id,
            });
            if (sucessful_transfer) {
              const beneficiary_old_Account_Balance = validated_Beneficiary.accountBalance;
              const beneficiary_new_AccountBalance = +amount + beneficiary_old_Account_Balance;

              const fulfilled_transaction = await User.update(
                { accountBalance: beneficiary_new_AccountBalance },
                {
                  where: {
                    accountNumber: beneficiary_AccountNumber,
                  },
                }
              );

              const sender_old_Account_Balance = sender_AccountBalance;
              const sender_new_Account_Balance =
                +sender_old_Account_Balance - +amount;

              const user_Transaction_Status = await User.update(
                { accountBalance: sender_new_Account_Balance },
                {
                  where: {
                    accountNumber: sender_accountNumber,
                  },
                }
              );

                const beneficiary_AccNumber = beneficiary_AccountNumber;
                const expected_beneficiary_balance: any = await User.findOne({
                  where: { accountNumber: beneficiary_AccNumber },
                });
                const expected_beneficiary_AccountBalance = expected_beneficiary_balance.accountBalance

                if (
                  beneficiary_new_AccountBalance !== expected_beneficiary_AccountBalance) {
                  const pending_transfer = await Transfers.create({
                    id: v4(),
                    accountNumber,
                    amount,
                    transfer_purpose,
                    beneficiary_name,
                    beneficiary_email,
                    payer_reference,
                    information_for_beneficiary,
                    status: "PENDING",
                    senderId: sender_id,
                  });

                  return res.status(400).json({
                    message: "Transaction PENDING",
                  });
                }

              if (fulfilled_transaction) {
                return res.status(200).json({
                  message: "Transaction Successful",
                });
              } else {
                const failed_transfer = await Transfers.create({
                  id: v4(),
                  accountNumber,
                  amount,
                  transfer_purpose,
                  beneficiary_name,
                  beneficiary_email,
                  payer_reference,
                  information_for_beneficiary,
                  status: "FAILED",
                  senderId: sender_id,
                });
                return res.status(400).json({
                  message: "Transaction Failed",
                });
              }
            }
          } else {
            return res.status(400).json({
              message: "Insufficient Funds",
            });
          }
        } else {
          return res.status(400).json({
            message: "Cannot make TRANSFER. Please check details properly.",
          });
        }
      } else {
        return res.status(400).json({
          message: "Beneficiary Account Number is not found",
        });
      }
    } else {
      return res.status(400).json({
        message: "You must be LOGGED IN to make a transfer",
      });
    }
  } catch (error) {
    console.error(error);
  }
};
