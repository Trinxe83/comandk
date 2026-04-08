// ── MOTOR DE NUTRICIÓN DINÁMICA ──────────────────────────────────────────────
// Genera planes nutricionales semanales adaptativos según perfil del usuario

const PLANES = {
  fuerza: {
    label: 'Fuerza Máxima',
    suplementos: [
      { nombre: 'Creatina Monohidrato', dosis: '5g/día', timing: 'Cualquier momento', ciencia: 'Aumenta fuerza máxima un 8% y potencia un 14% (Rawson & Volek, 2003).' },
      { nombre: 'Proteína de Suero (Whey)', dosis: '1–2 tomas/día sin sobrepasar objetivo proteico', timing: 'Post-entreno (0–2h)', ciencia: 'Maximiza síntesis de proteína miofibrilar: pico de MPS a los 90 min post-ingesta (Wit et al., 1997).' },
      { nombre: 'Cafeína', dosis: '3–6 mg/kg', timing: '30–60 min pre-entreno', ciencia: 'Mejora rendimiento de fuerza un 11% y reduce RPE (Grgic et al., 2018).' },
    ],
    dias: (macros, peso) => [
      { dia:'LUNES', entrena:true, comidas:[
        { momento:'☀️ Desayuno (7:00)', alimentos:`Avena ${Math.round(peso*1.1)}g + proteína suero 30g + plátano + almendras 20g`, macro:`C: ${Math.round(peso*0.8)}g · P: 40g · G: 12g` },
        { momento:'🥗 Almuerzo (13:00)', alimentos:`Arroz integral ${Math.round(peso*2)}g + pechuga pollo ${Math.round(peso*2.3)}g + brócoli + aceite oliva 10ml`, macro:`C: 60g · P: 50g · G: 10g` },
        { momento:'🍌 Pre-Entreno (17:30)', alimentos:`Boniato ${Math.round(peso*1.5)}g + atún natural 100g`, macro:`C: 38g · P: 26g · G: 2g` },
        { momento:'🥛 Post-Entreno (20:00)', alimentos:`Whey 40g + leche semidesnatada 300ml + plátano`, macro:`C: 48g · P: 47g · G: 7g` },
        { momento:'🌙 Cena (21:30)', alimentos:`Salmón ${Math.round(peso*2.5)}g + espárragos + boniato 100g`, macro:`C: 25g · P: 44g · G: 16g` },
      ]},
      { dia:'MARTES', entrena:false, comidas:[
        { momento:'☀️ Desayuno', alimentos:'Huevos revueltos 3 + tostada integral 2 + aguacate ½', macro:'C: 30g · P: 22g · G: 20g' },
        { momento:'🥗 Almuerzo', alimentos:'Lentejas guisadas 200g + ensalada verde + aceite oliva', macro:'C: 48g · P: 18g · G: 8g' },
        { momento:'🍎 Merienda', alimentos:'Cottage 200g + manzana + nueces 20g', macro:'C: 25g · P: 28g · G: 14g' },
        { momento:'🌙 Cena', alimentos:'Merluza vapor 200g + judías verdes + arroz integral 80g', macro:'C: 30g · P: 38g · G: 4g' },
      ]},
      { dia:'MIÉRCOLES', entrena:true, comidas:[
        { momento:'☀️ Desayuno', alimentos:'Tortilla 3 huevos + avena 60g + frutos rojos', macro:'C: 42g · P: 28g · G: 12g' },
        { momento:'🥗 Almuerzo', alimentos:'Pasta integral 130g + carne magra 150g + tomate + aceite', macro:'C: 65g · P: 38g · G: 10g' },
        { momento:'🍌 Pre-Entreno', alimentos:'Tostada integral + crema cacahuete 20g + plátano', macro:'C: 45g · P: 8g · G: 10g' },
        { momento:'🥛 Post-Entreno', alimentos:'Whey 40g + avena 50g + leche', macro:'C: 50g · P: 43g · G: 7g' },
        { momento:'🌙 Cena', alimentos:'Pechuga pavo 200g + brócoli + patata pequeña asada', macro:'C: 28g · P: 45g · G: 4g' },
      ]},
      { dia:'JUEVES', entrena:false, comidas:[
        { momento:'☀️ Desayuno', alimentos:'Yogur griego 200g + granola 40g + miel + kiwi', macro:'C: 45g · P: 20g · G: 10g' },
        { momento:'🥗 Almuerzo', alimentos:'Garbanzos 200g + pollo desmenuzado 150g + pimiento asado', macro:'C: 40g · P: 42g · G: 12g' },
        { momento:'🍎 Merienda', alimentos:'Atún lata + arroz inflado 30g + pepino', macro:'C: 20g · P: 26g · G: 2g' },
        { momento:'🌙 Cena', alimentos:'Bacalao horno 200g + pisto verduras + quinoa 80g', macro:'C: 32g · P: 40g · G: 6g' },
      ]},
      { dia:'VIERNES', entrena:true, comidas:[
        { momento:'☀️ Desayuno', alimentos:'Avena 80g + proteína 30g + fresas + chía 10g', macro:'C: 58g · P: 38g · G: 10g' },
        { momento:'🥗 Almuerzo', alimentos:'Arroz integral 150g + pechuga 180g + aguacate ½ + lima', macro:'C: 55g · P: 50g · G: 14g' },
        { momento:'🍌 Pre-Entreno', alimentos:'Dátiles 30g + proteína suero 20g', macro:'C: 30g · P: 20g · G: 1g' },
        { momento:'🥛 Post-Entreno', alimentos:'Leche desnatada 400ml + proteína 30g + plátano', macro:'C: 40g · P: 42g · G: 4g' },
        { momento:'🌙 Cena', alimentos:'Solomillo cerdo 180g + judías + espinacas salteadas', macro:'C: 15g · P: 45g · G: 8g' },
      ]},
      { dia:'SÁBADO', entrena:false, comidas:[
        { momento:'☀️ Desayuno', alimentos:'Pancakes avena-huevo (3) + miel + arándanos', macro:'C: 55g · P: 20g · G: 10g' },
        { momento:'🥗 Almuerzo', alimentos:'Pollo asado + patatas horno + ensalada', macro:'C: 45g · P: 42g · G: 12g' },
        { momento:'🍎 Merienda', alimentos:'Queso fresco + membrillo + nueces', macro:'C: 20g · P: 16g · G: 15g' },
        { momento:'🌙 Cena', alimentos:'Ensalada atún, huevo, tomate, maíz, arroz integral', macro:'C: 35g · P: 32g · G: 8g' },
      ]},
      { dia:'DOMINGO', entrena:false, comidas:[
        { momento:'☀️ Brunch', alimentos:'Huevos Benedict + salmón ahumado + tostada integral + fruta', macro:'C: 35g · P: 30g · G: 18g' },
        { momento:'🥗 Comida', alimentos:'Pollo asado 200g + patatas horno + ensalada', macro:'C: 45g · P: 42g · G: 12g' },
        { momento:'🌙 Cena ligera', alimentos:'Caldo verduras + tortilla 2 huevos + manzana', macro:'C: 18g · P: 14g · G: 8g' },
      ]},
    ]
  },

  perdida: {
    label: 'Pérdida de Grasa',
    suplementos: [
      { nombre: 'Cafeína', dosis: '3–6 mg/kg', timing: '30 min pre-entreno', ciencia: 'Aumenta oxidación de grasa un 16% durante ejercicio aeróbico (Acheson et al., 2004).' },
      { nombre: 'Proteína de Suero (Whey)', dosis: '1–2g/kg/día mínimo', timing: 'Distribuida en 4–5 tomas', ciencia: 'Preserva masa muscular en déficit calórico. Mayor efecto saciante que carbohidratos (Weigle et al., 2005).' },
      { nombre: 'Omega-3 (EPA+DHA)', dosis: '2–4g EPA+DHA/día', timing: 'Con comidas principales', ciencia: 'Reduce marcadores inflamatorios y mejora oxidación lipídica en tejido adiposo (Smith et al., 2011).' },
    ],
    dias: (macros, peso) => [
      { dia:'LUNES', entrena:true, comidas:[
        { momento:'☀️ Desayuno (7:00)', alimentos:`Huevos 3 + espinacas + té verde / café`, macro:`C: 5g · P: 21g · G: 15g` },
        { momento:'🥗 Almuerzo (13:00)', alimentos:`Pechuga pollo ${Math.round(peso*2)}g + ensalada grande + aceite oliva 5ml`, macro:`C: 10g · P: 42g · G: 8g` },
        { momento:'🍌 Pre-Entreno (17:30)', alimentos:`Manzana + proteína suero 20g`, macro:`C: 28g · P: 20g · G: 1g` },
        { momento:'🥛 Post-Entreno (20:00)', alimentos:`Whey 30g + leche desnatada 250ml`, macro:`C: 15g · P: 35g · G: 2g` },
        { momento:'🌙 Cena (21:00)', alimentos:`Merluza 200g + verduras al vapor abundantes`, macro:`C: 12g · P: 38g · G: 3g` },
      ]},
      { dia:'MARTES', entrena:false, comidas:[
        { momento:'☀️ Desayuno', alimentos:'Yogur griego 0% 200g + frutos rojos + semillas chía', macro:'C: 18g · P: 18g · G: 3g' },
        { momento:'🥗 Almuerzo', alimentos:'Salmón 150g + ensalada con pepino, tomate, rúcula', macro:'C: 8g · P: 32g · G: 14g' },
        { momento:'🍎 Merienda', alimentos:'Cottage 150g + pepino + aceitunas 20g', macro:'C: 6g · P: 22g · G: 8g' },
        { momento:'🌙 Cena', alimentos:'Pavo 180g + brócoli al vapor + caldo', macro:'C: 8g · P: 40g · G: 4g' },
      ]},
      { dia:'MIÉRCOLES', entrena:true, comidas:[
        { momento:'☀️ Desayuno', alimentos:'Avena 50g + clara huevo 4 + canela', macro:'C: 38g · P: 18g · G: 4g' },
        { momento:'🥗 Almuerzo', alimentos:'Atún 2 latas + arroz integral 80g + tomate', macro:'C: 32g · P: 42g · G: 3g' },
        { momento:'🍌 Pre-Entreno', alimentos:'Plátano pequeño + cafeína (café)', macro:'C: 22g · P: 1g · G: 0g' },
        { momento:'🥛 Post-Entreno', alimentos:'Whey 30g + leche desnatada 200ml', macro:'C: 12g · P: 32g · G: 2g' },
        { momento:'🌙 Cena', alimentos:'Gambas salteadas 200g + espárragos + AOVE', macro:'C: 5g · P: 36g · G: 10g' },
      ]},
      { dia:'JUEVES', entrena:false, comidas:[
        { momento:'☀️ Desayuno', alimentos:'Revuelto 2 huevos + salmón ahumado 60g + pepino', macro:'C: 3g · P: 26g · G: 16g' },
        { momento:'🥗 Almuerzo', alimentos:'Ensalada de lentejas 150g + atún + AOVE limón', macro:'C: 28g · P: 30g · G: 8g' },
        { momento:'🍎 Merienda', alimentos:'Almendras 25g + manzana', macro:'C: 20g · P: 6g · G: 14g' },
        { momento:'🌙 Cena', alimentos:'Pollo al horno 180g + ensalada verde + caldo', macro:'C: 6g · P: 38g · G: 6g' },
      ]},
      { dia:'VIERNES', entrena:true, comidas:[
        { momento:'☀️ Desayuno', alimentos:'Tortilla 3 claras + 1 yema + tomate + café', macro:'C: 4g · P: 20g · G: 8g' },
        { momento:'🥗 Almuerzo', alimentos:'Bacalao 200g + judías verdes + patata pequeña', macro:'C: 25g · P: 40g · G: 3g' },
        { momento:'🍌 Pre-Entreno', alimentos:'Boniato 80g + queso cottage 100g', macro:'C: 22g · P: 14g · G: 1g' },
        { momento:'🥛 Post-Entreno', alimentos:'Whey 30g + agua', macro:'C: 5g · P: 28g · G: 1g' },
        { momento:'🌙 Cena', alimentos:'Sepia a la plancha 200g + brócoli + AOVE', macro:'C: 4g · P: 34g · G: 11g' },
      ]},
      { dia:'SÁBADO', entrena:false, comidas:[
        { momento:'☀️ Desayuno', alimentos:'Yogur 0% 200g + granola light 25g + fresas', macro:'C: 25g · P: 14g · G: 2g' },
        { momento:'🥗 Almuerzo', alimentos:'Pechuga pavo 180g + quinoa 80g + pisto', macro:'C: 34g · P: 38g · G: 8g' },
        { momento:'🌙 Cena', alimentos:'Sopa miso + merluza 150g + ensalada', macro:'C: 10g · P: 32g · G: 4g' },
      ]},
      { dia:'DOMINGO', entrena:false, comidas:[
        { momento:'☀️ Brunch', alimentos:'Revuelto 2 huevos + verduras asadas + café/té', macro:'C: 12g · P: 18g · G: 14g' },
        { momento:'🥗 Comida (refeed opcional +150kcal carbs)', alimentos:'Pasta integral 100g + salmón + ensalada', macro:'C: 55g · P: 36g · G: 10g' },
        { momento:'🌙 Cena ligera', alimentos:'Caldo verduras + pollo 150g + pepino', macro:'C: 6g · P: 30g · G: 3g' },
      ]},
    ]
  },

  resistencia: {
    label: 'Resistencia / Stamina',
    suplementos: [
      { nombre: 'Carbohidratos de rápida absorción', dosis: '30–60g/hora durante actividad >60min', timing: 'Durante el entrenamiento', ciencia: 'Retrasa la fatiga central al mantener glucemia estable (Burke & Deakin, 2006).' },
      { nombre: 'Beta-Alanina', dosis: '3.2–6.4g/día', timing: 'Dividido en 2–4 tomas', ciencia: 'Aumenta carnosina muscular, reduciendo fatiga ácida en esfuerzos de 1–4 min (Hobson et al., 2012).' },
      { nombre: 'Bicarbonato sódico (opcional)', dosis: '0.3g/kg', timing: '60–90 min pre-entrenamiento', ciencia: 'Mejora rendimiento en esfuerzos anaeróbicos 1–7 min un 1.7%. Solo para atletas sin sensibilidad gástrica.', videoId:'' },
    ],
    dias: (macros, peso) => [
      { dia:'LUNES', entrena:true, comidas:[
        { momento:'☀️ Desayuno (6:30)', alimentos:`Avena ${Math.round(peso*1.2)}g + miel 15g + plátano + leche`, macro:`C: 80g · P: 18g · G: 8g` },
        { momento:'🥗 Almuerzo (12:30)', alimentos:`Pasta integral 160g + pechuga ${Math.round(peso*1.8)}g + tomate + AOVE`, macro:`C: 80g · P: 40g · G: 10g` },
        { momento:'🍌 Durante Entreno', alimentos:'Gel energético o plátano maduro + agua electrolitos', macro:'C: 25g · P: 0g · G: 0g' },
        { momento:'🥛 Post-Entreno (20:00)', alimentos:'Arroz blanco 150g + atún 2 latas + zanahoria', macro:'C: 55g · P: 34g · G: 3g' },
        { momento:'🌙 Cena', alimentos:'Pechuga pavo 180g + boniato 150g + judías verdes', macro:'C: 40g · P: 38g · G: 4g' },
      ]},
      { dia:'MARTES', entrena:false, comidas:[
        { momento:'☀️ Desayuno', alimentos:'Tostadas integrales 3 + AOVE + tomate + jamón york', macro:'C: 45g · P: 20g · G: 8g' },
        { momento:'🥗 Almuerzo', alimentos:'Arroz integral 140g + lentejas 100g + verduras', macro:'C: 70g · P: 22g · G: 6g' },
        { momento:'🍎 Merienda', alimentos:'Plátano + yogur griego + granola', macro:'C: 50g · P: 12g · G: 5g' },
        { momento:'🌙 Cena', alimentos:'Merluza 200g + patata cocida 120g + ensalada', macro:'C: 30g · P: 36g · G: 4g' },
      ]},
      { dia:'MIÉRCOLES', entrena:true, comidas:[
        { momento:'☀️ Desayuno', alimentos:'Pan integral 3 rebanadas + aguacate + 2 huevos', macro:'C: 48g · P: 22g · G: 18g' },
        { momento:'🥗 Almuerzo', alimentos:'Quinoa 120g + pollo 160g + pimiento asado', macro:'C: 55g · P: 38g · G: 8g' },
        { momento:'🍌 Durante Entreno', alimentos:'Plátano + agua + sal', macro:'C: 22g · P: 0g · G: 0g' },
        { momento:'🥛 Post-Entreno', alimentos:'Leche entera 400ml + cornflakes 50g', macro:'C: 45g · P: 18g · G: 14g' },
        { momento:'🌙 Cena', alimentos:'Salmón 170g + arroz integral 100g + brócoli', macro:'C: 38g · P: 35g · G: 14g' },
      ]},
      { dia:'JUEVES', entrena:false, comidas:[
        { momento:'☀️ Desayuno', alimentos:'Cereales integrales 60g + leche + fruta', macro:'C: 55g · P: 12g · G: 5g' },
        { momento:'🥗 Almuerzo', alimentos:'Garbanzos estofado 220g + chorizo magro + pan', macro:'C: 60g · P: 28g · G: 14g' },
        { momento:'🍎 Merienda', alimentos:'Dátiles 6 uds + almendras 20g', macro:'C: 38g · P: 5g · G: 10g' },
        { momento:'🌙 Cena', alimentos:'Pollo asado 180g + patatas panaderas + ensalada', macro:'C: 40g · P: 38g · G: 10g' },
      ]},
      { dia:'VIERNES', entrena:true, comidas:[
        { momento:'☀️ Desayuno', alimentos:'Avena 90g + miel + kiwi 2 + nueces', macro:'C: 75g · P: 14g · G: 12g' },
        { momento:'🥗 Almuerzo', alimentos:'Arroz blanco 160g + bacalao 180g + tomate', macro:'C: 60g · P: 38g · G: 4g' },
        { momento:'🍌 Durante Entreno', alimentos:'Gel o plátano + bebida isotónica', macro:'C: 35g · P: 0g · G: 0g' },
        { momento:'🥛 Post-Entreno', alimentos:'Whey 30g + leche entera 300ml + miel', macro:'C: 30g · P: 36g · G: 10g' },
        { momento:'🌙 Cena', alimentos:'Pechuga 200g + pizza integral casera pequeña', macro:'C: 55g · P: 40g · G: 10g' },
      ]},
      { dia:'SÁBADO', entrena:false, comidas:[
        { momento:'☀️ Desayuno', alimentos:'Pancakes avena-huevo + sirope de arce + frutas', macro:'C: 65g · P: 18g · G: 10g' },
        { momento:'🥗 Almuerzo', alimentos:'Paella de verduras y pollo ración mediana', macro:'C: 70g · P: 35g · G: 12g' },
        { momento:'🌙 Cena', alimentos:'Sopa verduras + sardinas 150g + pan integral', macro:'C: 35g · P: 28g · G: 10g' },
      ]},
      { dia:'DOMINGO', entrena:false, comidas:[
        { momento:'☀️ Brunch', alimentos:'French toast integral 3 + huevos + frutas', macro:'C: 60g · P: 20g · G: 12g' },
        { momento:'🥗 Comida (carga de carbos pre-semana)', alimentos:'Pasta integral 180g + atún + verdura', macro:'C: 85g · P: 36g · G: 8g' },
        { momento:'🌙 Cena', alimentos:'Pollo 160g + arroz blanco 100g + caldo', macro:'C: 40g · P: 34g · G: 4g' },
      ]},
    ]
  },

  hipertrofia: {
    label: 'Hipertrofia',
    suplementos: [
      { nombre: 'Creatina Monohidrato', dosis: '5g/día (sin carga)', timing: 'Post-entreno o en la misma comida', ciencia: 'Aumenta volumen celular, síntesis de glucógeno y producción de ATP. Efecto acumulativo en 4 semanas (Greenhaff, 1997).' },
      { nombre: 'Proteína de Suero (Whey) + Caseína', dosis: 'Whey post-entreno; Caseína nocturna', timing: 'Whey 0–2h post; Caseína antes de dormir', ciencia: 'Caseína nocturna aumenta la MPS nocturna un 22% vs placebo (Res et al., 2012). Whey potencia MPS post-entreno.' },
      { nombre: 'Zinc + Magnesio (ZMA)', dosis: 'Zn 30mg + Mg 450mg', timing: '30–60 min antes de dormir', ciencia: 'Restaura niveles de testosterona y IGF-1 deprimidos por entrenamiento intenso (Brilla & Conte, 2000).' },
    ],
    dias: (macros, peso) => [
      { dia:'LUNES', entrena:true, comidas:[
        { momento:'☀️ Desayuno (7:00)', alimentos:`Avena ${Math.round(peso*1.1)}g + Whey 30g + plátano + almendras 25g`, macro:`C: 65g · P: 42g · G: 14g` },
        { momento:'🥗 Almuerzo (13:00)', alimentos:`Arroz integral 160g + pechuga ${Math.round(peso*2.3)}g + guacamole`, macro:`C: 62g · P: 52g · G: 16g` },
        { momento:'🍌 Pre-Entreno (17:30)', alimentos:`Boniato 150g + queso cottage 150g`, macro:`C: 40g · P: 22g · G: 2g` },
        { momento:'🥛 Post-Entreno (20:00)', alimentos:'Whey 45g + leche entera 300ml + miel + plátano', macro:'C: 55g · P: 50g · G: 12g' },
        { momento:'🌙 Cena (21:30)', alimentos:`Salmón 220g + patata asada + espárragos`, macro:`C: 30g · P: 46g · G: 18g` },
        { momento:'🌑 Pre-Sueño', alimentos:'Caseína 40g + leche entera 200ml', macro:'C: 18g · P: 45g · G: 8g' },
      ]},
      { dia:'MARTES', entrena:false, comidas:[
        { momento:'☀️ Desayuno', alimentos:'Tortilla 4 huevos + avena 70g + frutos rojos + AOVE', macro:'C: 50g · P: 32g · G: 16g' },
        { momento:'🥗 Almuerzo', alimentos:'Lentejas 220g + pechuga 150g + pan integral', macro:'C: 55g · P: 44g · G: 8g' },
        { momento:'🍎 Merienda', alimentos:'Requesón 200g + granola 40g + miel', macro:'C: 40g · P: 30g · G: 8g' },
        { momento:'🌙 Cena', alimentos:'Pechuga pavo 200g + quinoa 100g + verduras', macro:'C: 40g · P: 46g · G: 6g' },
        { momento:'🌑 Pre-Sueño', alimentos:'Caseína 30g + yogur griego', macro:'C: 12g · P: 36g · G: 4g' },
      ]},
      { dia:'MIÉRCOLES', entrena:true, comidas:[
        { momento:'☀️ Desayuno', alimentos:'Pancakes avena-huevo (4) + sirope maple + proteína', macro:'C: 60g · P: 38g · G: 12g' },
        { momento:'🥗 Almuerzo', alimentos:'Pasta integral 140g + ternera magra 160g + tomate', macro:'C: 68g · P: 42g · G: 12g' },
        { momento:'🍌 Pre-Entreno', alimentos:'Plátano + miel + café', macro:'C: 35g · P: 2g · G: 0g' },
        { momento:'🥛 Post-Entreno', alimentos:'Whey 45g + leche entera + miel + granola', macro:'C: 55g · P: 50g · G: 10g' },
        { momento:'🌙 Cena', alimentos:'Lubina 200g + patata cocida 150g + judías verdes', macro:'C: 32g · P: 40g · G: 4g' },
        { momento:'🌑 Pre-Sueño', alimentos:'Caseína 40g + leche 200ml + nueces', macro:'C: 16g · P: 46g · G: 16g' },
      ]},
      { dia:'JUEVES', entrena:false, comidas:[
        { momento:'☀️ Desayuno', alimentos:'Yogur griego 250g + granola 50g + miel + plátano', macro:'C: 55g · P: 22g · G: 10g' },
        { momento:'🥗 Almuerzo', alimentos:'Garbanzos 200g + pechuga 160g + pimiento asado', macro:'C: 42g · P: 44g · G: 12g' },
        { momento:'🍎 Merienda', alimentos:'Batido: leche entera 400ml + avena 50g + cacao', macro:'C: 58g · P: 20g · G: 14g' },
        { momento:'🌙 Cena', alimentos:'Bacalao 200g + pisto abundante + quinoa 80g', macro:'C: 34g · P: 40g · G: 6g' },
        { momento:'🌑 Pre-Sueño', alimentos:'Cottage 250g + canela', macro:'C: 10g · P: 28g · G: 4g' },
      ]},
      { dia:'VIERNES', entrena:true, comidas:[
        { momento:'☀️ Desayuno', alimentos:'Avena 90g + Whey 30g + fresas + semillas', macro:'C: 65g · P: 40g · G: 10g' },
        { momento:'🥗 Almuerzo', alimentos:'Arroz integral 160g + pollo 200g + aguacate + lima', macro:'C: 58g · P: 52g · G: 16g' },
        { momento:'🍌 Pre-Entreno', alimentos:'Dátiles 40g + Whey 20g', macro:'C: 40g · P: 22g · G: 1g' },
        { momento:'🥛 Post-Entreno', alimentos:'Leche entera 400ml + Whey 40g + plátano', macro:'C: 48g · P: 48g · G: 14g' },
        { momento:'🌙 Cena', alimentos:'Solomillo cerdo 200g + patata asada + espinacas', macro:'C: 28g · P: 48g · G: 10g' },
        { momento:'🌑 Pre-Sueño', alimentos:'Caseína 40g + leche 150ml + almendras', macro:'C: 14g · P: 46g · G: 18g' },
      ]},
      { dia:'SÁBADO', entrena:false, comidas:[
        { momento:'☀️ Desayuno', alimentos:'Waffles integrales + sirope + huevos + zumo naranja', macro:'C: 70g · P: 24g · G: 12g' },
        { momento:'🥗 Almuerzo', alimentos:'Arroz con lechazo o pollo al horno + pan + ensalada', macro:'C: 65g · P: 42g · G: 14g' },
        { momento:'🌙 Cena', alimentos:'Salmón + quinoa 100g + verduras asadas', macro:'C: 40g · P: 40g · G: 16g' },
        { momento:'🌑 Pre-Sueño', alimentos:'Yogur griego 200g + nueces', macro:'C: 10g · P: 20g · G: 16g' },
      ]},
      { dia:'DOMINGO', entrena:false, comidas:[
        { momento:'☀️ Brunch', alimentos:'Huevos Benedict + salmón + tostada + aguacate + zumo', macro:'C: 42g · P: 34g · G: 22g' },
        { momento:'🥗 Comida', alimentos:'Paella con mariscos ración generosa + ensalada', macro:'C: 75g · P: 38g · G: 12g' },
        { momento:'🌙 Cena', alimentos:'Caldo hueso + tortilla 3 huevos + fruta', macro:'C: 20g · P: 22g · G: 14g' },
        { momento:'🌑 Pre-Sueño', alimentos:'Caseína 35g + leche caliente', macro:'C: 14g · P: 40g · G: 6g' },
      ]},
    ]
  }
};

export function generarPlanNutricion(perfil) {
  const obj = perfil.objetivo || 'fuerza';
  const plan = PLANES[obj] || PLANES.fuerza;
  const macros = calcularMacros(perfil);
  const peso = perfil.peso || 75;
  return {
    label: plan.label,
    suplementos: plan.suplementos,
    dias: plan.dias(macros, peso),
  };
}

function calcularMacros(perfil) {
  const { peso, altura, edad, sexo, objetivo } = perfil;
  if (!peso || !altura || !edad) return null;
  let tmb = sexo === 'F'
    ? 447.6 + (9.25*peso) + (3.1*altura) - (4.33*edad)
    : 88.36 + (13.4*peso) + (4.8*altura) - (5.68*edad);
  let kcal = Math.round(tmb * 1.55);
  if (objetivo === 'perdida') kcal -= 400;
  if (objetivo === 'hipertrofia') kcal += 250;
  return { kcal };
}
