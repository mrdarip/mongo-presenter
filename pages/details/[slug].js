import { isValidUrl } from "@/lib/utils";
import { MongoClient, ObjectId } from "mongodb";
import TextToLink from "@/components/TextToLink";
import React from "react";
import ExpandableText from "@/components/ExpandableText";

export async function getStaticPaths() {
  const { MONGODB_URI, MONGODB_DATABASE, MONGODB_COLLECTION } = process.env;

  if (!MONGODB_URI || !MONGODB_DATABASE || !MONGODB_COLLECTION) {
    throw new Error("Missing MongoDB configuration in .env file");
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(MONGODB_DATABASE);
    const collection = db.collection(MONGODB_COLLECTION);

    const documents = await collection
      .aggregate([{ $project: { _id: 1 } }])
      .toArray();

    const paths = documents.map((doc) => ({
      params: { slug: doc._id.toString() },
    }));

    return {
      paths,
      fallback: true, // Enable ISR for new paths
    };
  } finally {
    await client.close();
  }
}

export async function getStaticProps({ params }) {
  const {
    MONGODB_URI,
    MONGODB_DATABASE,
    MONGODB_COLLECTION,
    MONGODB_DETAILS_AGGREGATE_QUERY,
    MONGODB_COLLECTION2,
    MONGODB_MAIN_AGGREGATE_QUERY2,
    MONGODB_FIELD_TO_MATCH,
  } = process.env;

  if (!MONGODB_URI || !MONGODB_DATABASE || !MONGODB_COLLECTION) {
    throw new Error("Missing MongoDB configuration in .env file");
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(MONGODB_DATABASE);
    const collection = db.collection(MONGODB_COLLECTION);

    const envPipeline = JSON.parse(MONGODB_DETAILS_AGGREGATE_QUERY);
    const pipeline = [{ $match: { _id: new ObjectId(params.slug) } }].concat(
      envPipeline
    );

    const document = await collection.aggregate(pipeline).toArray();

    const collection2 = db.collection(MONGODB_COLLECTION2);
    const envPipeline2 = JSON.parse(MONGODB_MAIN_AGGREGATE_QUERY2);

    const valueToMatch = (
      await collection
        .aggregate([{ $match: { _id: new ObjectId(params.slug) } }])
        .toArray()
    )[0][MONGODB_FIELD_TO_MATCH];

    const pipeline2 = [
      { $match: { [MONGODB_FIELD_TO_MATCH]: valueToMatch } },
    ].concat(envPipeline2);
    const document2 = await collection2.aggregate(pipeline2).toArray();

    if (!document) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        document: JSON.parse(JSON.stringify(document)),
        document2: JSON.parse(JSON.stringify(document2)),
      },
      revalidate: 10, // Revalidate every 10 seconds
    };
  } finally {
    await client.close();
  }
}

export default function Details({ document, document2 }) {
  if (!document) return <div>Loading...</div>;

  const cleanDocument = document.map((doc) => {
    const cleanedDoc = { ...doc };
    delete cleanedDoc._id;
    return cleanedDoc;
  })[0];

  return (
    <>
      <section>
        <h1>Document Details</h1>

        {Object.keys(cleanDocument).map((key) => (
          <div key={key}>
            <strong>{key}</strong>:
            <p>
              <TextToLink value={cleanDocument[key]} />
            </p>
          </div>
        ))}
      </section>
      <section>
        <h2>Related Documents</h2>
        <div className="full-width">
          <table>
            <thead>
              <tr>
                {document2.length > 0 &&
                  Object.keys(document2[0])
                    .filter((key) => key !== "_id")
                    .map((key) => <th key={key}>{key}</th>)}
              </tr>
            </thead>
            <tbody>
              {document2.map((doc) => (
                <tr key={doc._id}>
                  {Object.keys(doc)
                    .filter((key) => key !== "_id")
                    .map((key) => (
                      <td key={key}>
                        <ExpandableText
                          className="longCode"
                          text={toPrettyJson(doc[key])}
                        />
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <button onClick={() => window.history.back()}>Go Back</button>
      </section>
    </>
  );
}

function toPrettyJson(value) {
  if (typeof value === "string") {
    return value; // Return plain strings without quotes
  }
  return JSON.stringify(value, null, 2); // Pretty print other types
}
