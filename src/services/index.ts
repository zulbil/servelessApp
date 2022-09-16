import dynamoDBClient from "../models/database";
import GroupService from "./GroupService";

const groupService = new GroupService(dynamoDBClient());
export default groupService;