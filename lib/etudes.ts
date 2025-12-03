// lib/etudes.ts
import { StudyStatus } from '@/types/study';
import { supabase } from '../utils/supabase';

export type Etude = {
  id: string;
  titre: string;
  statut?: StudyStatus | null;
  montant?: number | null;     // CA
  client?: string | null;
  created_at?: string;
};

// Liste (tri desc) + conversion numeric→number au besoin
export async function listEtudes(): Promise<Etude[]> {
  try {
    const { data, error } = await supabase
      .from('etudes')
      .select('id,titre,statut,montant,client,created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('listEtudes error:', error);
      return [];
    }

    return (data ?? []).map(r => ({
      ...r,
      montant: r.montant == null ? null : Number(r.montant),
    }));
  } catch (e) {
    console.error('listEtudes exception:', e);
    return [];
  }
}

// Realtime : fetch initial + refetch sur insert/update/delete
export function listenEtudes(cb: (rows: Etude[]) => void) {
  let isActive = true;

  const emit = async () => {
    try {
      const rows = await listEtudes();
      if (isActive) cb(rows);
    } catch (e) {
      console.error('listenEtudes emit error:', e);
    }
  };

  // initial
  emit().catch(e => console.error('listenEtudes initial fetch error:', e));

  try {
    const channel = supabase
      .channel('etudes-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'etudes' },
        () => emit().catch(e => console.error('listenEtudes refresh error:', e))
      )
      .subscribe();

    return () => {
      isActive = false;
      try {
        supabase.removeChannel(channel);
      } catch (e) {
        console.error('listenEtudes unsubscribe error:', e);
      }
    };
  } catch (e) {
    console.error('listenEtudes exception:', e);
    return () => {
      isActive = false;
    };
  }
}

// Création complète (titre, statut, montant, client)
export async function addEtudeFull(params: {
  titre: string;
  statut?: StudyStatus | null;
  montant?: number | null;
  client?: string | null;
}): Promise<Etude | null> {
  try {
    const payload = {
      titre: params.titre,
      statut: params.statut ?? 'en_cours',
      montant: params.montant ?? null,
      client: params.client ?? null,
    };

    const { data, error } = await supabase
      .from('etudes')
      .insert(payload)
      .select('id,titre,statut,montant,client,created_at')
      .single();

    if (error) {
      console.error('addEtudeFull error:', error);
      return null;
    }
    return data as Etude;
  } catch (e) {
    console.error('addEtudeFull exception:', e);
    return null;
  }
}

// Mise à jour statut
export async function updateStatut(id: string, statut: StudyStatus): Promise<boolean> {
  try {
    const { error } = await supabase.from('etudes').update({ statut }).eq('id', id);
    if (error) {
      console.error('updateStatut error:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('updateStatut exception:', e);
    return false;
  }
}

// Suppression
export async function deleteEtude(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('etudes').delete().eq('id', id);
    if (error) {
      console.error('deleteEtude error:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('deleteEtude exception:', e);
    return false;
  }
}
