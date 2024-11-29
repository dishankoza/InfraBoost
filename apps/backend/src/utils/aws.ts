import { DescribeInstancesCommand, EC2Client, Instance } from "@aws-sdk/client-ec2";

class AWSError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export const createClient = (region: string): EC2Client => {
  return new EC2Client({ region: region });
};

export const listInstances = async (client: EC2Client): Promise<Array<Instance>> => {
  const params = {
    Filters: [
      {
        Name: "tag:created_by",
        Values: ["quikcloud"],
      },
    ],
  };

  try {
    const command = new DescribeInstancesCommand(params);
    const response = await client.send(command);
    let results: Array<Instance> = [];
    response.Reservations?.forEach((reservation) => {
      reservation.Instances?.forEach((instance) => {
        results.push(instance);
      });
    });
    return results;
  } catch (err: any) {
    console.log(err);
    throw new AWSError("Error listing EC2 instances.");
  }
};
