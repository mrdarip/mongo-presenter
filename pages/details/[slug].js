import { MongoClient, ObjectId } from 'mongodb';

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

    const documents = await collection.find({}).toArray();

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
  const { MONGODB_URI, MONGODB_DATABASE, MONGODB_COLLECTION } = process.env;

  if (!MONGODB_URI || !MONGODB_DATABASE || !MONGODB_COLLECTION) {
    throw new Error('Missing MongoDB configuration in .env file');
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(MONGODB_DATABASE);
    const collection = db.collection(MONGODB_COLLECTION);

    const document = await collection.findOne({ _id: new ObjectId(params.slug) });

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

  const columns =
  {"num_expediente": "Num Expediente",
  "lugar": "Lugar",
  "valor_estimado": "Valor Estimado",
  "origen": "Origen"};

  return (
    <div>
      <h1>Document Details</h1>

      {Object.keys(columns).map((key) => (
        <section key={key}>
          <strong>{columns[key]}:</strong>
          <p>{document[key]}</p>
        </section>
      ))}
      
      <button onClick={() => window.history.back()}>Go Back</button>

    </div>
  );
}