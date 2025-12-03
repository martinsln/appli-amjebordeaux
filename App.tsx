import { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { supabase } from './utils/supabase';

type Etude = {
  id: string;
  titre: string;
  statut?: string | null;
  created_at?: string;
};

export default function App() {
  const [etudes, setEtudes] = useState<Etude[]>([]);

  useEffect(() => {
    const getEtudes = async () => {
      try {
        const { data, error } = await supabase
          .from('etudes')
          .select('id,titre,statut,created_at')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erreur Supabase :', error.message);
          return;
        }
        setEtudes(data ?? []);
      } catch (error: any) {
        console.error('Erreur de récupération :', error?.message ?? error);
      }
    };

    getEtudes();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
        Liste des études
      </Text>
      <FlatList
        data={etudes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text>{item.titre}</Text>
        )}
      />
    </View>
  );
}