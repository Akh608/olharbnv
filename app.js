let configData = {};

// Carregar o JSON de configuração ao iniciar
fetch('config_ocorrencias_benavente.json')
  .then(res => res.json())
  .then(data => {
    configData = data;
    inicializarFormulario();
  });

function inicializarFormulario() {
  // Povoar Freguesias
  const selectFreguesia = document.getElementById('freguesia');
  configData.freguesias.forEach(f => {
    selectFreguesia.innerHTML += `<option value="${f.id}">${f.label}</option>`;
  });

  // Povoar Nível 1 (Temas)
  const selectTema = document.getElementById('tema');
  for (const [key, val] of Object.entries(configData.taxonomia)) {
    selectTema.innerHTML += `<option value="${key}">${val.label}</option>`;
  }

  // Event Listeners para atualizar dropdowns em cascata
  selectTema.addEventListener('change', atualizarTipos);
  document.getElementById('tipo').addEventListener('change', atualizarProblemas);

  atualizarTipos();
}

function atualizarTipos() {
  const temaKey = document.getElementById('tema').value;
  const selectTipo = document.getElementById('tipo');
  selectTipo.innerHTML = '';

  const tipos = configData.taxonomia[temaKey].tipos;
  for (const [key, val] of Object.entries(tipos)) {
    selectTipo.innerHTML += `<option value="${key}">${val.label}</option>`;
  }
  atualizarProblemas();
}

function atualizarProblemas() {
  const temaKey = document.getElementById('tema').value;
  const tipoKey = document.getElementById('tipo').value;
  const selectProblema = document.getElementById('problema');
  selectProblema.innerHTML = '';

  const problemas = configData.taxonomia[temaKey].tipos[tipoKey].problemas;
  problemas.forEach(p => {
    selectProblema.innerHTML += `<option value="${p.label}">${p.label}</option>`;
  });
}

function obterGPS() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      document.getElementById('coords').value = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
    }, () => alert("Não foi possível obter a localização."));
  }
}

function gerarEmail() {
  const freguesiaId = document.getElementById('freguesia').value;
  const temaKey = document.getElementById('tema').value;
  const tipoKey = document.getElementById('tipo').value;
  const problemaLabel = document.getElementById('problema').value;
  const coords = document.getElementById('coords').value;
  const morada = document.getElementById('morada').value;
  const detalhes = document.getElementById('detalhes').value;

  const regra = configData.regras_roteamento[temaKey];
  const freguesiaInfo = configData.freguesias.find(f => f.id === freguesiaId);

  // Construir Lista de Destinatários
  let toList = regra.to.map(e => configData.entidades[e].email);
  let ccList = regra.cc.map(e => configData.entidades[e].email);

  if (regra.cc_freguesia && freguesiaInfo) {
    ccList.push(configData.entidades[freguesiaInfo.entidade].email);
  }

  if (regra.cc_posto_gnr_local && freguesiaInfo.posto_gnr) {
    ccList.push(configData.entidades[freguesiaInfo.posto_gnr].email);
  }

  // Montar Texto do Email
  const assunto = `[OLHAR POR BENAVENTE] - ${configData.taxonomia[temaKey].label} (${freguesiaInfo.label})`;
  
  const corpo = `Ao Executivo / Serviços Competentes,

Nos termos do direito de petição e do Código do Procedimento Administrativo, venho por este meio reportar formalmente a seguinte anomalia no espaço público no concelho de Benavente:

• Freguesia: ${freguesiaInfo.label}
• Categoria: ${configData.taxonomia[temaKey].label} > ${configData.taxonomia[temaKey].tipos[tipoKey].label}
• Ocorrência: ${problemaLabel}
• Coordenadas GPS: ${coords ? coords : 'Não indicadas'} ${coords ? `(https://maps.google.com/?q=${coords})` : ''}
• Ponto de Referência: ${morada || 'N/A'}

Detalhes:
${detalhes || 'Sem detalhes adicionais.'}

(Fotografia em anexo a este email).

Solicita-se a tomada de medidas urgentes e a devida informação sobre o seguimento do processo.

Cumprimentos,
Munícipe Residente`;

  const mailtoUrl = `mailto:${toList.join(',')}?cc=${ccList.join(',')}&subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
  
  window.location.href = mailtoUrl;
}
