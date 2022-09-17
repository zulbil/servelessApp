import dynamoDBClient from "../models/database";
import GroupService from "./GroupService";
import ImageService from "./ImageService";

export const groupService = new GroupService(dynamoDBClient());
export const imageService = new ImageService(dynamoDBClient());
