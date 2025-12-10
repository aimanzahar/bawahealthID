/* DO NOT EDIT - This is a generated file. */
import type { TableNamesInDataModel } from "convex/server";

export type TableNames = TableNamesInDataModel<DataModel>;

export type DataModel = {
  users: {
    type: "table";
    fieldMappings: {
      email: {
        name: "email";
        type: "string";
      };
      password: {
        name: "password";
        type: "string";
      };
      name: {
        name: "name";
        type: "string | undefined";
        optional: true;
      };
      phoneNumber: {
        name: "phoneNumber";
        type: "string | undefined";
        optional: true;
      };
      nricNumber: {
        name: "nricNumber";
        type: "string | undefined";
        optional: true;
      };
      myDigitalIdVerified: {
        name: "myDigitalIdVerified";
        type: "boolean";
      };
      createdAt: {
        name: "createdAt";
        type: "number";
      };
      updatedAt: {
        name: "updatedAt";
        type: "number";
      };
    };
    indexes: {
      by_email: ["email"];
      by_phone: ["phoneNumber"];
    };
    document: {
      _id: { fieldName: "_id"; type: "Id<" | "\"users\">"; optional: false };
      _creationTime: { fieldName: "_creationTime"; type: "number"; optional: false };
      email: { fieldName: "email"; type: "string"; optional: false };
      password: { fieldName: "password"; type: "string"; optional: false };
      name: { fieldName: "name"; type: "string"; optional: true };
      phoneNumber: { fieldName: "phoneNumber"; type: "string"; optional: true };
      nricNumber: { fieldName: "nricNumber"; type: "string"; optional: true };
      myDigitalIdVerified: { fieldName: "myDigitalIdVerified"; type: "boolean"; optional: false };
      createdAt: { fieldName: "createdAt"; type: "number"; optional: false };
      updatedAt: { fieldName: "updatedAt"; type: "number"; optional: false };
      system: { fieldName: "system"; type: { reader: any } | { writer: any } | null; optional: false };
    };
  };
  myDigitalIdApplications: {
    type: "table";
    fieldMappings: {
      userId: {
        name: "userId";
        type: "Id<\"users\">";
      };
      fullName: {
        name: "fullName";
        type: "string";
      };
      nricNumber: {
        name: "nricNumber";
        type: "string";
      };
      dateOfBirth: {
        name: "dateOfBirth";
        type: "string";
      };
      gender: {
        name: "gender";
        type: "string";
      };
      nationality: {
        name: "nationality";
        type: "string";
      };
      address: {
        name: "address";
        type: "string";
      };
      city: {
        name: "city";
        type: "string";
      };
      postalCode: {
        name: "postalCode";
        type: "string";
      };
      state: {
        name: "state";
        type: "string";
      };
      phoneNumber: {
        name: "phoneNumber";
        type: "string";
      };
      email: {
        name: "email";
        type: "string";
      };
      photoUrl: {
        name: "photoUrl";
        type: "string | undefined";
        optional: true;
      };
      verificationStatus: {
        name: "verificationStatus";
        type: "\"pending\" | \"approved\" | \"rejected\"";
      };
      applicationDate: {
        name: "applicationDate";
        type: "number";
      };
      reviewedAt: {
        name: "reviewedAt";
        type: "number | undefined";
        optional: true;
      };
      reviewedBy: {
        name: "reviewedBy";
        type: "Id<\"users\"> | undefined";
        optional: true;
      };
      rejectionReason: {
        name: "rejectionReason";
        type: "string | undefined";
        optional: true;
      };
    };
    indexes: {
      by_user: ["userId"];
      by_status: ["verificationStatus"];
    };
    document: {
      _id: { fieldName: "_id"; type: "Id<" | "\"myDigitalIdApplications\">"; optional: false };
      _creationTime: { fieldName: "_creationTime"; type: "number"; optional: false };
      userId: { fieldName: "userId"; type: "Id<\"users\">"; optional: false };
      fullName: { fieldName: "fullName"; type: "string"; optional: false };
      nricNumber: { fieldName: "nricNumber"; type: "string"; optional: false };
      dateOfBirth: { fieldName: "dateOfBirth"; type: "string"; optional: false };
      gender: { fieldName: "gender"; type: "string"; optional: false };
      nationality: { fieldName: "nationality"; type: "string"; optional: false };
      address: { fieldName: "address"; type: "string"; optional: false };
      city: { fieldName: "city"; type: "string"; optional: false };
      postalCode: { fieldName: "postalCode"; type: "string"; optional: false };
      state: { fieldName: "state"; type: "string"; optional: false };
      phoneNumber: { fieldName: "phoneNumber"; type: "string"; optional: false };
      email: { fieldName: "email"; type: "string"; optional: false };
      photoUrl: { fieldName: "photoUrl"; type: "string"; optional: true };
      verificationStatus: { fieldName: "verificationStatus"; type: "\"pending\" | \"approved\" | \"rejected\""; optional: false };
      applicationDate: { fieldName: "applicationDate"; type: "number"; optional: false };
      reviewedAt: { fieldName: "reviewedAt"; type: "number"; optional: true };
      reviewedBy: { fieldName: "reviewedBy"; type: "Id<\"users\">"; optional: true };
      rejectionReason: { fieldName: "rejectionReason"; type: "string"; optional: true };
      system: { fieldName: "system"; type: { reader: any } | { writer: any } | null; optional: false };
    };
  };
};

export type Doc<DM extends DataModel = DataModel, Table extends TableNames = TableNames> = DM[Table]["document"];