import { DocumentClient } from "aws-sdk/clients/dynamodb";
import Image from "../models/Image";

export default class GroupService {
    private Tablename: string = process.env.IMAGES_TABLE;

    constructor(private docClient: DocumentClient) {}

    async getImageByGroup() : Promise<Image[]> {
        /**
         * @TODO : get images by group
         *  
         * */ 
    }

}