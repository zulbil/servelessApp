import dynamoDBClient from "../models/database";
import GroupService from "./GroupService";
import ImageService from "./ImageService";
import ConnectionService from "./ConnectionService";

export const groupService = new GroupService(dynamoDBClient());
export const imageService = new ImageService(dynamoDBClient());
export const connectionService = new ConnectionService(dynamoDBClient());
