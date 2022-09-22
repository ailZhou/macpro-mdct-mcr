import handler from "../handler-lib";
import dynamoDb from "../../utils/dynamo/dynamodb-lib";
import { StatusCodes } from "../../utils/types/types";
import { NO_KEY_ERROR_MESSAGE } from "../../utils/constants/constants";

export const getReportMetadata = handler(async (event, _context) => {
  if (!event?.pathParameters?.state! || !event?.pathParameters?.reportId!) {
    throw new Error(NO_KEY_ERROR_MESSAGE);
  }
  const queryParams = {
    TableName: process.env.REPORT_METADATA_TABLE_NAME!,
    KeyConditionExpression: "#state = :state AND #reportId = :reportId",
    ExpressionAttributeValues: {
      ":state": event.pathParameters.state,
      ":reportId": event.pathParameters.reportId,
    },
    ExpressionAttributeNames: {
      "#state": "state",
      "#reportId": "reportId",
    },
  };
  const reportQueryResponse = await dynamoDb.query(queryParams);

  const responseBody = reportQueryResponse.Items![0] ?? {};

  return {
    status: StatusCodes.SUCCESS,
    body: responseBody,
  };
});

export const getAllReportsByState = handler(async (event, _context) => {
  if (!event?.pathParameters?.state!) {
    throw new Error(NO_KEY_ERROR_MESSAGE);
  }
  const queryParams = {
    TableName: process.env.REPORT_METADATA_TABLE_NAME!,
    KeyConditionExpression: "#state = :state",
    ExpressionAttributeValues: {
      ":state": event.pathParameters.state,
    },
    ExpressionAttributeNames: {
      "#state": "state",
    },
  };
  const reportQueryResponse = await dynamoDb.query(queryParams);

  return {
    status: StatusCodes.SUCCESS,
    body: reportQueryResponse.Items,
  };
});