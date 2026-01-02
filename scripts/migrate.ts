import { supabase } from '../src/lib/supabase';
import { db, storage } from '../src/lib/firebase';
import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { readFileSync } from 'fs';
import { join } from 'path';

async function downloadFile(url: string): Promise<Buffer> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function migrateConfiguration() {
  console.log('Migrando configuración...');
  try {
    const { data: config, error } = await supabase
      .from('configuracion')
      .select('*')
      .single();

    if (error) throw error;

    // Si hay un logo, descargarlo y subirlo a Firebase Storage
    let newLogoUrl = null;
    if (config.logo_url) {
      const logoBuffer = await downloadFile(config.logo_url);
      const storageRef = ref(storage, `site/logo.${config.logo_url.split('.').pop()}`);
      await uploadBytes(storageRef, logoBuffer);
      newLogoUrl = await getDownloadURL(storageRef);
    }

    await setDoc(doc(db, 'configuracion', 'default'), {
      ...config,
      logo_url: newLogoUrl,
      updated_at: Timestamp.now()
    });

    console.log('✅ Configuración migrada exitosamente');
  } catch (error) {
    console.error('❌ Error al migrar configuración:', error);
  }
}

async function migrateSocios() {
  console.log('Migrando socios...');
  try {
    const { data: socios, error } = await supabase
      .from('socios')
      .select('*');

    if (error) throw error;

    const sociosRef = collection(db, 'socios');

    for (const socio of socios) {
      // Si hay un logo, descargarlo y subirlo a Firebase Storage
      let newLogoUrl = null;
      if (socio.logo_url) {
        const logoBuffer = await downloadFile(socio.logo_url);
        const storageRef = ref(storage, `logos/socios/${socio.id}.${socio.logo_url.split('.').pop()}`);
        await uploadBytes(storageRef, logoBuffer);
        newLogoUrl = await getDownloadURL(storageRef);
      }

      await setDoc(doc(sociosRef, socio.id), {
        ...socio,
        logo_url: newLogoUrl,
        created_at: Timestamp.fromDate(new Date(socio.created_at)),
        updated_at: Timestamp.fromDate(new Date(socio.updated_at))
      });
    }

    console.log(`✅ ${socios.length} socios migrados exitosamente`);
  } catch (error) {
    console.error('❌ Error al migrar socios:', error);
  }
}

async function migrateArtistas() {
  console.log('Migrando artistas...');
  try {
    const { data: artistas, error } = await supabase
      .from('artistas')
      .select('*');

    if (error) throw error;

    const artistasRef = collection(db, 'artistas');

    for (const artista of artistas) {
      await setDoc(doc(artistasRef, artista.id), {
        ...artista,
        created_at: Timestamp.fromDate(new Date(artista.created_at)),
        updated_at: Timestamp.fromDate(new Date(artista.updated_at))
      });
    }

    console.log(`✅ ${artistas.length} artistas migrados exitosamente`);
  } catch (error) {
    console.error('❌ Error al migrar artistas:', error);
  }
}

async function migrateCupones() {
  console.log('Migrando cupones...');
  try {
    const { data: cupones, error } = await supabase
      .from('cupones')
      .select('*');

    if (error) throw error;

    const cuponesRef = collection(db, 'cupones');

    for (const cupon of cupones) {
      await setDoc(doc(cuponesRef, cupon.id), {
        ...cupon,
        fecha_descarga: Timestamp.fromDate(new Date(cupon.fecha_descarga)),
        fecha_agendado: cupon.fecha_agendado ? Timestamp.fromDate(new Date(cupon.fecha_agendado)) : null,
        fecha_cobrado: cupon.fecha_cobrado ? Timestamp.fromDate(new Date(cupon.fecha_cobrado)) : null,
        created_at: Timestamp.fromDate(new Date(cupon.created_at)),
        updated_at: Timestamp.fromDate(new Date(cupon.updated_at))
      });
    }

    console.log(`✅ ${cupones.length} cupones migrados exitosamente`);
  } catch (error) {
    console.error('❌ Error al migrar cupones:', error);
  }
}

async function migratePagos() {
  console.log('Migrando pagos...');
  try {
    const { data: pagos, error } = await supabase
      .from('pagos')
      .select('*');

    if (error) throw error;

    const pagosRef = collection(db, 'pagos');

    for (const pago of pagos) {
      await setDoc(doc(pagosRef, pago.id), {
        ...pago,
        fecha_pago: Timestamp.fromDate(new Date(pago.fecha_pago)),
        created_at: Timestamp.fromDate(new Date(pago.created_at)),
        updated_at: Timestamp.fromDate(new Date(pago.updated_at))
      });
    }

    console.log(`✅ ${pagos.length} pagos migrados exitosamente`);
  } catch (error) {
    console.error('❌ Error al migrar pagos:', error);
  }
}

async function main() {
  console.log('🚀 Iniciando migración de datos...');
  
  try {
    await migrateConfiguration();
    await migrateSocios();
    await migrateArtistas();
    await migrateCupones();
    await migratePagos();
    
    console.log('✨ Migración completada exitosamente');
  } catch (error) {
    console.error('💥 Error durante la migración:', error);
    process.exit(1);
  }
}

main();