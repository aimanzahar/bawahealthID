/* DO NOT EDIT - This is a generated file. */
import type {
  FunctionReference,
  InferReturnTypes,
  Args,
  ArgumentTypes,
  AnyDataModel,
} from "convex/server";
import type { DataModel } from "../schema";

export type FunctionArgs<Ref extends FunctionReference<any, "public">> =
  Ref extends FunctionReference<infer T, "public"> ? ArgumentTypes<T> : never;

export type FunctionReturnType<
  Ref extends FunctionReference<any, "public">
> = Ref extends FunctionReference<infer T, "public"> ? InferReturnTypes<T> : never;

export const api = {
  auth: {
    signUp: {
      name: "auth:signUp" as const,
      args: {
        email: "string",
        password: "string",
        name: "string | undefined",
      },
    },
    signIn: {
      name: "auth:signIn" as const,
      args: {
        email: "string",
        password: "string",
      },
    },
    getUser: {
      name: "auth:getUser" as const,
      args: {
        userId: "id:users",
      },
    },
    getCurrentUser: {
      name: "auth:getCurrentUser" as const,
      args: {},
    },
  },
  myDigitalId: {
    createApplication: {
      name: "myDigitalId:createApplication" as const,
      args: {
        userId: "id:users",
        fullName: "string",
        nricNumber: "string",
        dateOfBirth: "string",
        gender: "string",
        nationality: "string",
        address: "string",
        city: "string",
        postalCode: "string",
        state: "string",
        phoneNumber: "string",
        email: "string",
        photoUrl: "string | undefined",
      },
    },
    getApplicationByUser: {
      name: "myDigitalId:getApplicationByUser" as const,
      args: {
        userId: "id:users",
      },
    },
    updateApplicationStatus: {
      name: "myDigitalId:updateApplicationStatus" as const,
      args: {
        applicationId: "id:myDigitalIdApplications",
        status: "\"pending\" | \"approved\" | \"rejected\"",
        reviewedBy: "id:users",
        rejectionReason: "string | undefined",
      },
    },
  },
} as const;