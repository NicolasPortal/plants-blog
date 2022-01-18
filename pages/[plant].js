export default function MemoryPage({ plant }) {
  return (
    <pre>{JSON.stringify(plant, null, 2)}</pre>
  )
}

export async function getStaticProps({ params }) {
  const { plant } = params
  const url = `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}/environments/master`
  const query = `
    query GetPlant($slug: String!) {
      plantCollection(
        where: {
          slug: $slug
        },
        limit: 1
      ) {
        items{
          plantName
          slug
        }
      }
    }
  `
  const variables = { slug: plant }

  const result = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.CONTENTFUL_DELIVERY_TOKEN}`,
      'Content-type': 'application/json'
    },
    body: JSON.stringify({ query, variables })
  })

  if (!result.ok) {
    console.log(result)
    return {}
  }
  const { data } = await result.json()
  const [plantData] = data.plantCollection.items
  return {
    props: {
      plant: plantData
    }
  }
}

export async function getStaticPaths() {
  const url = `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}/environments/master`
  const query = `
    query GetPlantSlugs {
      plantCollection{
        items{
          slug
        }
      }
    }
  `
  const result = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.CONTENTFUL_DELIVERY_TOKEN}`,
      'Content-type': 'application/json'
    },
    body: JSON.stringify({ query })
  })

  if (!result.ok) {
    console.log(result)
    return {}
  }
  const { data } = await result.json()
  const plantSlugs = data.plantCollection.items
  const paths = plantSlugs.map(({ slug }) => ({ params: { plant: slug } }))
  return {
    paths,
    fallback: true
  }
}