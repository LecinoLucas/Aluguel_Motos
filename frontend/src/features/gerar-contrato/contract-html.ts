import type {
  ContratoTermos,
  LocadorData,
  LocatarioData,
  VeiculoData,
} from "./types";

export function formatDateBR(dateStr: string): string {
  if (!dateStr) return "___/___/______";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function formatDateExtenso(dateStr: string): string {
  if (!dateStr) return "__ de ________ de ____";
  const date = new Date(`${dateStr}T12:00:00`);
  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  return `${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`;
}

function valorPorExtenso(valor: string): string {
  const num = parseFloat(valor.replace(/\./g, "").replace(",", "."));
  if (isNaN(num)) return valor;
  const inteiro = Math.floor(num);
  const centavos = Math.round((num - inteiro) * 100);

  const unidades = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
  const especiais = ["dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
  const dezenas = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
  const centenas = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

  function converterAte999(n: number): string {
    if (n === 0) return "";
    if (n === 100) return "cem";
    const partes: string[] = [];
    const c = Math.floor(n / 100);
    const resto = n % 100;
    if (c > 0) partes.push(centenas[c]);
    if (resto >= 10 && resto <= 19) {
      partes.push(especiais[resto - 10]);
    } else {
      const d = Math.floor(resto / 10);
      const u = resto % 10;
      if (d > 0) partes.push(dezenas[d]);
      if (u > 0) partes.push(unidades[u]);
    }
    return partes.join(" e ");
  }

  function converterInteiro(n: number): string {
    if (n === 0) return "zero";
    const partes: string[] = [];
    const milhares = Math.floor(n / 1000);
    const resto = n % 1000;
    if (milhares === 1) partes.push("mil");
    else if (milhares > 1) partes.push(`${converterAte999(milhares)} mil`);
    if (resto > 0) {
      if (milhares > 0) partes.push("e");
      partes.push(converterAte999(resto));
    }
    return partes.join(" ");
  }

  let texto = converterInteiro(inteiro);
  texto = texto.charAt(0).toUpperCase() + texto.slice(1);

  if (centavos === 0) {
    return `${texto} reais`;
  }
  return `${texto} reais e ${converterAte999(centavos)} centavos`;
}

export function gerarContratoHTML(
  locador: LocadorData,
  locatario: LocatarioData,
  veiculo: VeiculoData,
  termos: ContratoTermos,
): string {
  const dataExtenso = formatDateExtenso(termos.dataContrato);
  const valorSemanalExtenso = valorPorExtenso(termos.valorSemanal);
  const valorCaucaoExtenso = valorPorExtenso(termos.valorCaucao);

  return `
<div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6; font-size: 14px; color: #000;">
  <h1 style="text-align: center; font-size: 18px; margin-bottom: 30px; font-weight: bold;">CONTRATO PARTICULAR DE LOCAÇÃO DE MOTOCICLETA</h1>
  
  <hr style="border: 1px solid #000; margin: 20px 0;" />
  
  <p style="text-align: justify;">
    <strong>LOCADOR: ${locador.nome.toUpperCase()}</strong>, ${locador.nacionalidade}, ${locador.estadoCivil}, inscrito no CPF sob o número ${locador.cpf}, RG n° ${locador.rg} ${locador.orgaoEmissor}, residente e domiciliado à ${locador.endereco}, ${locador.cidade}, ${locador.estado}, CEP ${locador.cep}. Telefone ${locador.telefone}.
  </p>
  
  <p style="text-align: justify;">
    <strong>LOCATÁRIO: ${locatario.nome.toUpperCase()}</strong>, ${locatario.nacionalidade}, ${locatario.estadoCivil}, inscrito no CPF sob o número ${locatario.cpf}, RG ${locatario.rg} ${locatario.orgaoEmissor}, residente e domiciliado à ${locatario.endereco}, ${locatario.cidade}, ${locatario.estado}, CEP ${locatario.cep}. Telefone: ${locatario.telefone}.
  </p>
  
  <p style="text-align: justify; font-style: italic;">
    As partes acima têm entre si justo e contratado a locação de veículo descrito no ANEXO 1 do presente contrato, nos seguintes termos e condições:
  </p>
  
  <p style="text-align: justify;">1.1. O veículo alugado, efetivo ou temporário, é de propriedade do LOCADOR, encontrando-se em perfeitas condições mecânicas de uso, conservação e funcionamento, tendo sido abastecido e revisado antes de ser posto à disposição do cliente e assim deve ser devolvido ao término do contrato de aluguel.</p>
  
  <p style="text-align: justify;">1.2. Os dados do veículo alugado, e demais características da locação serão anotadas no ANEXO 1 desse contrato, denominado "Demonstrativo de Aluguel de Veículos", o qual deverá ser assinado pelo cliente ou, quando da entrega para terceiro, autorizado por escrito, tornando, desta maneira, os dados e valores ali lançados, líquidos, certos e exigíveis.</p>
  
  <p style="text-align: justify;">1.3. Para os fins de comprovação das condições do veículo alugado (cláusula 1) será realizado, tanto no ato da entrega do veículo ao cliente, quanto na devolução, um "check list", conforme o ANEXO 2 deste contrato, assinado pelo cliente ou por terceiro autorizado (cláusula 1.4) ou usuário indicado, valendo este documento como comprovante da data e condições/estado em que fora entregue e posteriormente devolvido o veículo, podendo o LOCADOR valer-se do mesmo para cobrança judicial ou débito e/ou reparação de danos ou falta de acessórios do veículo alugado.</p>
  
  <p style="text-align: justify;">1.4. A devolução do veículo deverá ser efetuada pelo cliente. Todavia, caso esteja impossibilitado de fazê-lo, poderá ser realizada por terceira pessoa, ficando, pela presente cláusula, convencionado que o cliente outorgou ao terceiro plenos poderes para o ato, inclusive valendo sua assinatura no encerramento do contrato (cláusula 1.2) e no "check list" (cláusula 1.3) para os fins de direito, tornando os dados/valores do ANEXO 1 e 2, líquidos, certos e exigíveis.</p>
  
  <p style="text-align: justify;">1.5. Ao assinar o ANEXO 1, bem como o ANEXO 2, o cliente - ou o terceiro por ele autorizado - reconhece como verdadeiros os dados ali inseridos para todos os efeitos legais.</p>
  
  <h3 style="font-size: 14px; font-weight: bold; margin-top: 20px;">DA PROTEÇÃO LOCADOR</h3>
  
  <p style="text-align: justify;">2.1. O LOCADOR tem por dever de entregar o veículo com a revisão em dia, devendo a moto ser devolvido nas mesmas condições.</p>
  
  <p style="text-align: justify;">2.2. O valor da locação do veículo pretendido é o preço básico, com proteção oferecida pelo LOCADOR, assumindo o cliente todos os possíveis danos materiais e pessoais - inclusive contra terceiros - que vierem a ocorrer com relação ao veículo alugado, tais sejam: acidentes de trânsito, furto, roubo, incêndio, etc.</p>
  
  <p style="text-align: justify;">2.3. O LOCADOR, entretanto, oferece proteção em casos de furto, roubo, incêndio, colisão, avarias no carro alugado, bem como danos contra terceiros e pessoais destes, mediante o pagamento pelo cliente da taxa de franquia, a saber:</p>
  
  <p style="text-align: justify;">2.3.1. Proteção da motocicleta alugada: a proteção parcial oferecida pelo LOCADOR cobre todos os danos materiais que por ventura ocorrerem no veículo alugado, bem como furto, roubo e incêndio deste, tendo o cliente de participar com o pagamento no valor de R$1.000,00 (Hum Mil reais) referente a franquia cobrada pela proteção.</p>
  
  <p style="text-align: justify;">2.3.2. Proteção contra danos pessoais e materiais de terceiros: a proteção contra danos pessoais e materiais de terceiro oferecido pelo LOCADOR cobre todo e qualquer dano ocorrido em veículos de terceiros, até o limite máximo de R$ 10.000,00 (Dez mil reais).</p>
  
  <p style="text-align: justify;">2.4. A proteção LOCADOR não se entende a acessórios instalados na motocicleta, bem como proteção de carenagem, suporte de celular, antena corta pipa e outros, devendo o Locatário substituir por outro novo caso tenha sido danificado.</p>
  
  <p style="text-align: justify;">2.5. O cliente não fará jus à substituição da motocicleta alugada por outra, quando houver acidente ou defeito mecânico.</p>
  
  <h3 style="font-size: 14px; font-weight: bold; margin-top: 20px;">DAS OBRIGAÇÕES DO CLIENTE</h3>
  
  <p style="text-align: justify;">O cliente se compromete a:</p>
  
  <p style="text-align: justify;">3.1. Devolver o veículo na residência do LOCADOR, na data prevista no Demonstrativo de Aluguel de Veículos (ANEXO 1), sob pena de configuração de apropriação indébita (art. 168, do Código Penal), com sujeição às penas da lei, inclusive busca e apreensão do mesmo.</p>
  
  <p style="text-align: justify;">3.2. Caso o cliente deseje efetuar a devolução da motocicleta em local diverso, deverá comunicar seu desejo ao Locador, pagando a taxa de retorno de acordo com tabela expedida pelo LOCADOR.</p>
  
  <p style="text-align: justify;">3.3. Responsabilizar-se pela guarda e correto uso do veículo, trafegando unicamente em rodovias e/ou ruas de tráfego regular, dentro das normas do Código Nacional de Trânsito, sendo expressamente proibido utilizá-lo em estradas não asfaltadas.</p>
  
  <p style="text-align: justify;">3.4. Usar o veículo apenas para transporte de comida por aplicativo e/ou transporte de passageiros, observando seu limite de capacidade, sendo conduzido apenas pelo piloto indicado no Demonstrativo do Contrato de Aluguel (ANEXO 1), sob pena de infração contratual (quebra de contrato) e perda das garantias do LOCADOR.</p>
  
  <p style="text-align: justify;">3.6. Usar o veículo exclusivamente dentro da cidade de ${locador.cidade} e região metropolitana.</p>
  
  <p style="text-align: justify;">3.7. Comunicar ao LOCADOR imediatamente ocorrência de acidente, furto, roubo ou incêndio e providenciar Boletim de Ocorrência Policial ou Laudo Pericial, quando este se fizer necessário, no prazo máximo de 2 (dois) dias após o evento, sob pena de perda das garantias LOCADOR optada na contratação do aluguel, além de responsabilização pelas consequências do ocorrido.</p>
  
  <p style="text-align: justify;">3.8. Quando da ocorrência de avaria no veículo, deve de imediato entrar em contato com o locador ou assistência por ele indicada no momento da locação do veículo, recebendo instruções de como proceder para solucionar o problema ocorrido através da oficina indicada.</p>
  
  <p style="text-align: justify;">3.9. Ao entregar o veículo na oficina indicada para proceder aos reparos, o cliente deverá, sempre, exigir da mesma que imediatamente entre em contato com o Locador, para o fim de efetuar orçamento do custo dos reparos, e receber, autorização expressa para executar o serviço, sob pena de não procedendo desta forma, responsabilizar-se pelo seu pagamento.</p>
  
  <p style="text-align: justify;">3.10. Comunicar imediatamente ao Locador qualquer defeito que ocorra ou indicação de outras anormalidades do veículo e que, em decorrência disso, possa colocar em risco seu normal funcionamento.</p>
  
  <p style="text-align: justify;">3.11. Pagar o total do aluguel por ocasião da devolução do veículo ou, em caso de busca e apreensão, até a efetiva entrega do mesmo, bem como o valor do combustível faltante para completar o tanque.</p>
  
  <p style="text-align: justify;">3.12. Para os efeitos do Parágrafo 7o, artigo 257 do Código Nacional de Trânsito, assim que solicitado encaminhar ao LOCADOR, no prazo de 48 (quarenta e oito) horas, o nome e endereço do condutor infrator, bem como xerox de sua CNH, CIC e RG, pena de responsabilizar-se plenamente pela nova multa que será lavrada nos termos do Parágrafo 8º do Artigo referido. Caso não informe ao Locador os dados do condutor infrator, fornecerá ao DETRAN todos os dados do cliente necessários para a cobrança da multa ou outras penalidades.</p>
  
  <p style="text-align: justify;">3.13. Reembolsar ao Locador eventuais despesas efetuadas para reparação de danos decorrentes do mau uso do veículo, bem como outras despesas afins, como guinchamento do veículo locado e/ou terceiros prejudicados.</p>
  
  <p style="text-align: justify;">3.14. O não atendimento dos dispostos nas cláusulas 3.11, 3.12 e 3.13 configurará inadimplência contratual, ensejando a emissão de Nota Fiscal e Duplicata de Prestação de Serviços, pelo LOCADOR, acrescido dos valores apurados a título de despesas administrativas, bem como multa contratual na base de 2% (dois por cento), além de juros de 1% (um por cento) ao mês e correção monetária, ficando o Locador por este instrumento autorizado a protestar a citada Duplicata, como título de dívida líquida e certa.</p>
  
  <p style="text-align: justify;">3.15. A infração de qualquer dos itens do presente capítulo (Das Obrigações do Cliente) implicará na perda da garantia do LOCADOR optado e quebra contratual, perdendo o valor da caução.</p>
  
  <h3 style="font-size: 14px; font-weight: bold; margin-top: 20px;">DO USO INDEVIDO DO VEÍCULO</h3>
  
  <p style="text-align: justify;">4. Configurar-se-á o uso indevido do veículo e infração contratual, com perda da proteção do LOCADOR e perda do valor total da caução, quando:</p>
  
  <p style="text-align: justify; margin-left: 20px;">a) Ir com o veículo para fora da região metropolitana de ${locador.cidade}.</p>
  <p style="text-align: justify; margin-left: 20px;">b) em caso de acidente, furto, roubo ou colisão, tiver procedido com manifesto dolo ou culpa (imprudência, imperícia ou negligência), e/ou utilizado o veículo para fins diversos da destinação específica constante no Certificado de Registro e Licenciamento de veículo e/ou especificações do fabricante.</p>
  <p style="text-align: justify; margin-left: 20px;">c) entregar a direção do veículo a pessoa não indicada neste contrato ocasionará perda integral da caução e encerramento imediato do contrato.</p>
  <p style="text-align: justify; margin-left: 20px;">d) trafegar por vias públicas, rodovias e caminhos sem condições de tráfego e, em consequência, provocar danos ao veículo ou acidente com terceiro.</p>
  <p style="text-align: justify; margin-left: 20px;">e) infringir qualquer dispositivo do Código Nacional de Trânsito e, em decorrência disso, provocar acidente com terceiro ou dano ao veículo, principalmente no caso de velocidade imprimida acima do permitido para o local.</p>
  <p style="text-align: justify; margin-left: 20px;">f) Outras modalidades de uso do veículo que possam se configurar como mau uso do mesmo tais como adulteração/substituição de peças e acessórios da motocicleta sem a autorização do LOCADOR, comprovado esse através de laudo de oficina mecânica, funilaria especializada, testemunhas, fotos, vídeos ou outros meios legais.</p>
  
  <p style="text-align: justify;">4.1. Configurando-se qualquer das hipóteses da presente cláusula, e consequentemente perdendo o cliente a proteção LOCADOR, arcará com todos os prejuízos que causarão locador e/ou terceiros prejudicados, inclusive danos pessoais dos passageiros da motocicleta alugada e/ou terceiros, sem prejuízo das coberturas previstas no DPVAT. Ainda, pagará ao cliente, a título de lucro cessante, 70% (setenta por cento) do maior valor da diária contratada, pelo período que permanecer o veículo do Locador em conserto, até o limite de 30 (trinta) diárias.</p>
  
  <p style="text-align: justify;">4.2. Em decorrência deste contrato, quando não contratar qualquer tipo de proteção, ou ainda, quando perder a proteção LOCADOR, nos termos deste Contrato, o cliente isenta desde já o Locador de responsabilidades civis a qualquer título, bem assim de figurar como parte passiva em qualquer demanda oriunda de eventos que envolvam o carro alugado através deste Contrato, ônus que o cliente assume "de per si" e exclusivamente.</p>
  
  <p style="text-align: justify;">4.3. No caso de reparação do veículo, este atingir 70% (setenta por cento) do seu valor comercial, considerar-se-á como tendo ocorrido perda total do mesmo, tornando-se como seu valor aquele estabelecido pela TABELA FIPE.</p>
  
  <p style="text-align: justify;">4.4. A não devolução do veículo na data determinada no Demonstrativo do Contrato de Aluguel de Veículos (ANEXO 1) sem expressa autorização do Locador, igualmente configurará perda da proteção LOCADOR, para efeitos de indenização civil por danos a terceiros ou ao veículo alugado, perdurando essa responsabilidade até a efetiva devolução.</p>
  
  <h3 style="font-size: 14px; font-weight: bold; margin-top: 20px;">DAS DISPOSIÇÕES GERAIS</h3>
  
  <p style="text-align: justify;">5.1. As isenções de responsabilidades indenizatórias conferidas ao cliente não implicam em contratação de seguro. Significa, tão somente, que o LOCADOR assumiu, contratualmente, custos, prejuízos ou responsabilidades indenizatórias que eventualmente possam decorrer do uso e circulação normal da motocicleta alugada até os limites máximos fixados neste contrato.</p>
  
  <p style="text-align: justify;">5.2. O LOCADOR não responderá por quaisquer custos, pagamentos ou indenização excedente dos valores máximos das isenções de pagamentos ou responsabilidades indenizatórias contratualmente conferida ao cliente.</p>
  
  <p style="text-align: justify;">5.3. O LOCADOR poderá, a seu exclusivo critério, optar pela contratação de seguros facultativos de responsabilidade civil, que cubram os valores ou montantes das isenções de responsabilidade indenizatória que foram contratualmente deferidas ao cliente.</p>
  
  <p style="text-align: justify;">5.4. As eventuais tolerâncias do LOCADOR para com o cliente no cumprimento das obrigações ajustadas através deste contrato não importam em novação, permanecendo íntegras as cláusulas e condições deste contrato.</p>
  
  <p style="text-align: justify;">5.5. Nos casos de inadimplência, ficará sujeito o cliente, ao pagamento de multa contratual de 2% (dois por cento), bem como honorários advocatícios na base de 20% (vinte por cento) do valor total do débito, além de juros de 1% (um por cento) ao mês e correção monetária.</p>
  
  <p style="text-align: justify;">5.6. O Foro para qualquer procedimento judicial relativo com o presente contrato será o da cidade do LOCADOR, com renúncia expressa de qualquer outro, por mais privilegiado que possa ser, sem prejuízo da possibilidade de requerimento, pelo locador, de medidas cautelares em outro Foro.</p>
  
  <p style="text-align: justify;">E, por estarem justos e contratados, assinam o presente contrato em 2 (duas) vias de igual teor e forma, para que produza os efeitos legais.</p>
  
  <p style="text-align: center; margin-top: 30px;">${termos.localContrato}, ${dataExtenso}.</p>
  
  <div style="display: flex; justify-content: space-between; margin-top: 60px;">
    <div style="text-align: center; width: 45%;">
      <div style="border-top: 1px solid #000; padding-top: 5px;">
        <strong>LOCADOR</strong>
      </div>
    </div>
    <div style="text-align: center; width: 45%;">
      <div style="border-top: 1px solid #000; padding-top: 5px;">
        <strong>LOCATÁRIO/MOTORISTA</strong>
      </div>
    </div>
  </div>
  
  <div style="margin-top: 40px;">
    <p>Testemunhas:</p>
    <p style="margin-top: 30px;">1. ____________________________________<br/>Nome:<br/>RG:</p>
    <p style="margin-top: 20px;">2. ____________________________________<br/>Nome:<br/>RG:</p>
  </div>
  
  <div style="page-break-before: always;"></div>
  
  <h2 style="text-align: center; font-size: 16px; font-weight: bold; margin-top: 40px;">ANEXO 1 – DEMONSTRATIVO DE ALUGUEL DE VEÍCULOS</h2>
  
  <p style="text-align: justify;">Este demonstrativo é parte integrante do CONTRATO PARTICULAR DE LOCAÇÃO DE MOTOCICLETA, firmado entre:</p>
  
  <p style="text-align: justify;"><strong>LOCADOR: ${locador.nome.toUpperCase()}</strong>, ${locador.nacionalidade}, ${locador.estadoCivil}, inscrito no CPF sob o número ${locador.cpf}, RG n° ${locador.rg} ${locador.orgaoEmissor}, residente e domiciliado à ${locador.endereco}, ${locador.cidade}, ${locador.estado}, CEP ${locador.cep}. Telefone ${locador.telefone}.</p>
  
  <p style="text-align: justify;"><strong>LOCATÁRIO: ${locatario.nome.toUpperCase()}</strong>, ${locatario.nacionalidade}, ${locatario.estadoCivil}, inscrito no CPF sob o número ${locatario.cpf}, RG ${locatario.rg} ${locatario.orgaoEmissor}, residente e domiciliado à ${locatario.endereco}, ${locatario.cidade}, ${locatario.estado}, CEP ${locatario.cep}. Telefone: ${locatario.telefone}.</p>
  
  <p style="margin-top: 20px;">Dados e características do veículo locado:</p>
  
  <p style="margin-left: 20px;">
    <strong>MARCA:</strong> ${veiculo.marca}<br/>
    <strong>MODELO:</strong> ${veiculo.modelo}<br/>
    <strong>ANO:</strong> ${veiculo.ano}<br/>
    <strong>COR:</strong> ${veiculo.cor}<br/>
    <strong>PLACA:</strong> ${veiculo.placa}<br/>
    ${veiculo.chassi ? `<strong>CHASSI:</strong> ${veiculo.chassi}<br/>` : ""}
    <strong>RENAVAM:</strong> ${veiculo.renavam}
  </p>
  
  <p style="text-align: justify; margin-top: 20px;"><strong>CHEQUE CAUÇÃO:</strong> R$ ${termos.valorCaucao} (${valorCaucaoExtenso}), devolvido após 30 dias da entrega da motocicleta com o checklist final, caso não exista avarias ou multas, o valor será devolvido integralmente. Caso o locatário deseje entregar a motocicleta antes do final do contrato, ou deixar por mais de 24h de pagar o valor semanal, será cobrado o valor de R$${termos.valorCaucao} (${valorCaucaoExtenso}) referente a multa de quebra contratual ensejando na entrega da Motocicleta ao LOCADOR.</p>
  
  <p><strong>VALOR DO ALUGUEL SEMANAL:</strong> R$ ${termos.valorSemanal} (${valorSemanalExtenso}).</p>
  <p><strong>FORMA DE PAGAMENTO:</strong> R$ ${termos.valorSemanal} (${valorSemanalExtenso}), ${termos.formaPagamento}.</p>
  <p><strong>PRAZO DE LOCAÇÃO:</strong> de ${formatDateBR(termos.dataInicio)} a ${formatDateBR(termos.dataFim)}</p>
  
  <p style="margin-top: 15px;"><strong>Nome do motorista que utilizará este veículo:</strong> ${locatario.nome.toUpperCase()} <strong>CNH:</strong> ${locatario.cnh}.</p>
  
  <p style="text-align: justify; margin-top: 15px;">Pelo presente termo, o LOCATÁRIO autoriza o LOCADOR a encaminhar ao Departamento de Trânsito, em nome do motorista que utilizar o veículo acima, a(s) multa(s) decorrente(s) de infrações eventualmente cometidas, no período de locação.</p>
  
  <p style="text-align: center; margin-top: 20px;">${termos.localContrato}, ${dataExtenso}.</p>
  
  <div style="display: flex; justify-content: space-between; margin-top: 60px;">
    <div style="text-align: center; width: 45%;"><div style="border-top: 1px solid #000; padding-top: 5px;"><strong>LOCADOR</strong></div></div>
    <div style="text-align: center; width: 45%;"><div style="border-top: 1px solid #000; padding-top: 5px;"><strong>LOCATÁRIO/MOTORISTA</strong></div></div>
  </div>
  
  <div style="page-break-before: always;"></div>
  
  <h2 style="text-align: center; font-size: 16px; font-weight: bold; margin-top: 40px;">ANEXO 2 – INSPEÇÃO DO VEÍCULO LOCADO</h2>
  
  <p style="text-align: justify;"><strong>LOCATÁRIO: ${locatario.nome.toUpperCase()}</strong>, ${locatario.nacionalidade}, ${locatario.estadoCivil}, inscrito no CPF sob o número ${locatario.cpf}, RG ${locatario.rg} ${locatario.orgaoEmissor}, residente e domiciliado à ${locatario.endereco}, ${locatario.cidade}, ${locatario.estado}, CEP ${locatario.cep}. Telefone: ${locatario.telefone}.</p>
  
  <p style="margin-top: 20px;">Dados e características do veículo locado:</p>
  
  <p style="margin-left: 20px;">
    <strong>MARCA:</strong> ${veiculo.marca}<br/>
    <strong>MODELO:</strong> ${veiculo.modelo}<br/>
    <strong>ANO:</strong> ${veiculo.ano}<br/>
    <strong>COR:</strong> ${veiculo.cor}<br/>
    <strong>PLACA:</strong> ${veiculo.placa}<br/>
    ${veiculo.chassi ? `<strong>CHASSI:</strong> ${veiculo.chassi}<br/>` : ""}
    <strong>RENAVAM:</strong> ${veiculo.renavam}
  </p>
  
  <p><strong>PRAZO DE LOCAÇÃO:</strong> de ${formatDateBR(termos.dataInicio)} a ${formatDateBR(termos.dataFim)}</p>
  <p><strong>Km do hodômetro:</strong> ${termos.kmHodometro || "______"}</p>
  
  <p style="margin-top: 20px;">Inspeção do veículo pelo locatário:</p>
  <p>( &nbsp;) Carenagem sem riscos</p>
  <p>( &nbsp;) Placa traseira</p>
  <p>( &nbsp;) Acessórios (indicar):</p>
  <p>____________________________________________________________________________</p>
  <p>____________________________________________________________________________</p>
  
  <p style="margin-top: 15px;">Ressalvas do locatário:</p>
  <p>____________________________________________________________________________</p>
  <p>____________________________________________________________________________</p>
  
  <p style="margin-top: 20px;"><strong>DATA DA ENTREGA DO VEÍCULO:</strong> ${formatDateBR(termos.dataInicio)}.</p>
  
  <p style="text-align: justify; margin-top: 15px;">Declaro que conferi o estado do veículo ora entregue para locação, recebendo-o por este termo conforme contrato de locação de veículos firmado em ${formatDateBR(termos.dataContrato)}.</p>
  
  <div style="text-align: center; margin-top: 60px;">
    <div style="border-top: 1px solid #000; display: inline-block; padding-top: 5px; min-width: 300px;">
      <strong>LOCATÁRIO/MOTORISTA</strong>
    </div>
  </div>
</div>`;
}