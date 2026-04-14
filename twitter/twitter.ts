import { TwitterApi } from "twitter-api-v2";

function getClient(): TwitterApi {
  const key = process.env.X_API_KEY;
  const secret = process.env.X_API_SECRET;
  const token = process.env.X_ACCESS_TOKEN;
  const tokenSecret = process.env.X_ACCESS_TOKEN_SECRET;

  if (!key || !secret || !token || !tokenSecret) {
    throw new Error("Missing X API credentials in .env");
  }

  return new TwitterApi({ appKey: key, appSecret: secret, accessToken: token, accessSecret: tokenSecret });
}

export async function postTweet(text: string): Promise<string> {
  const client = getClient();
  const { data } = await client.v2.tweet(text);
  return data.id;
}
