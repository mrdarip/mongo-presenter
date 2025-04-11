import { isValidUrl } from '@/lib/utils';
import { MongoClient, ObjectId } from 'mongodb';
import TextToLink from '@/components/TextToLink';

export async function getStaticPaths() {
  const { MONGODB_URI, MONGODB_DATABASE, MONGODB_COLLECTION } = process.env;

  if (!MONGODB_URI || !MONGODB_DATABASE || !MONGODB_COLLECTION) {
    throw new Error('Missing MongoDB configuration in .env file');
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(MONGODB_DATABASE);
    const collection = db.collection(MONGODB_COLLECTION);

    const documents = await collection.aggregate([{$project:{_id:1}}]).toArray();

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
  const { MONGODB_URI, MONGODB_DATABASE, MONGODB_COLLECTION, MONGODB_DETAILS_AGGREGATE_QUERY } = process.env;

  if (!MONGODB_URI || !MONGODB_DATABASE || !MONGODB_COLLECTION) {
    throw new Error('Missing MongoDB configuration in .env file');
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(MONGODB_DATABASE);
    const collection = db.collection(MONGODB_COLLECTION);

    const envPipeline = JSON.parse(MONGODB_DETAILS_AGGREGATE_QUERY);
    const pipeline = [{$match: { _id: new ObjectId(params.slug) } }].concat(envPipeline);

    const document = await collection.aggregate(pipeline).toArray();

    if (!document) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        document: JSON.parse(JSON.stringify(document)),
      },
      revalidate: 10, // Revalidate every 10 seconds
    };
  } finally {
    await client.close();
  }
}

export default function Details({ document }) {
  if (!document) return <div>Loading...</div>;

  const cleanDocument = document.map((doc) => {
    const cleanedDoc = { ...doc };;
    delete cleanedDoc._id;
    return cleanedDoc;
  })[0];

  return (
    <div>
      <h1>Document Details</h1>

      {Object.keys(cleanDocument).map((key) => (
        <div key={key}>
          <strong>{key}</strong>: 
          <p>
            <TextToLink value={cleanDocument[key]} />
          </p>
          
        </div>
      ))}
      
      <button onClick={() => window.history.back()}>Go Back</button>

    </div>
  );
}