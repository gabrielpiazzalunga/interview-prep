// Call AniList GraphQL endpoint to fetch a Studio (id 10).
// We only care about success/failure so this returns a boolean.
export async function callAnilistStudio(): Promise<boolean> {
  const query = `
    query {
      Studio(id: 10) {
        id
        isAnimationStudio
        isFavourite
        name
      }
    }
  `;

  try {
    const res = await fetch('https://graphql.anilist.co/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) return false;

    const json = await res.json();
    if (json.errors) return false;

    // success if data and Studio are present
    return !!(json.data && json.data.Studio);
  } catch (err) {
    console.error('Network or parsing error calling AniList:', err);
    return false;
  }
}
