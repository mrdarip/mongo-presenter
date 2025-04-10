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

  return (
    <div>
      <h1>Document Details</h1>
      <div>
        <strong>Num Expediente:</strong> {document.num_expediente}
      </div>
      <div>
        <strong>Lugar:</strong> {document.lugar}
      </div>
      <div>
        <strong>Valor Estimado:</strong> {document.valor_estimado}
      </div>
      <div>
        <strong>Duracion Contrato:</strong> {document.duracion_contrato}
      </div>
      <div>
        <strong>Organo Contratacion:</strong> {document.organo_contratacion}
      </div>
      <div>
        <strong>Titulo Expediente:</strong> {document.titulo_expediente}
      </div>
      <div>
        <strong>Descripcion:</strong> {document.descripcion}
      </div>
    </div>
  );
}