export type Post = {
  id: string; // doc id
  userId: string; // uid dueño
  username?: string; // nombre visible (si lo tienes)
  userEmail?: string; // opcional si no tienes username
  imageUrl: string; // url de storage
  caption: string; // texto del post
  likesCount?: number; // número de likes
  storagePath?: string; // opcional pero MUY útil: posts/{uid}/{file}
  createdAt: any; // serverTimestamp
};
