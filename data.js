/* =====================================================================
 * FitLab — Banco de dados nativo
 * Grupos musculares, aparelhos, exercícios, metodologias, divisões,
 * fases de periodização, alimentos (referência TACO/USDA aproximada),
 * suplementos e atividades aeróbicas. Valores nutricionais são
 * referências por 100 g (ou 100 ml); o histórico real sempre prevalece.
 * ===================================================================== */
window.FIT_DB = (function () {
  'use strict';

  const slug = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  /* ---------- Grupos musculares ---------- */
  const grupos = [
    { id: 'peito', nome: 'Peito', regiao: 'superior', cor: '#e0576a', mev: 8, mav: 14, mrv: 22 },
    { id: 'dorsal', nome: 'Dorsal', regiao: 'superior', cor: '#3f7fd6', mev: 10, mav: 16, mrv: 25 },
    { id: 'trapezio', nome: 'Trapézio', regiao: 'superior', cor: '#5a9bd4', mev: 4, mav: 10, mrv: 20 },
    { id: 'ombro', nome: 'Ombro', regiao: 'superior', cor: '#f0a13a', mev: 8, mav: 16, mrv: 26 },
    { id: 'biceps', nome: 'Bíceps', regiao: 'superior', cor: '#8e63c9', mev: 6, mav: 14, mrv: 20 },
    { id: 'triceps', nome: 'Tríceps', regiao: 'superior', cor: '#b56bd6', mev: 6, mav: 12, mrv: 18 },
    { id: 'antebraco', nome: 'Antebraço', regiao: 'superior', cor: '#a58cd8', mev: 2, mav: 8, mrv: 14 },
    { id: 'abdomen', nome: 'Abdômen', regiao: 'core', cor: '#2aa89a', mev: 0, mav: 10, mrv: 20 },
    { id: 'lombar', nome: 'Lombar', regiao: 'core', cor: '#2f8f84', mev: 0, mav: 6, mrv: 12 },
    { id: 'quadriceps', nome: 'Quadríceps', regiao: 'inferior', cor: '#d9822b', mev: 8, mav: 14, mrv: 20 },
    { id: 'isquiotibiais', nome: 'Ísquiotibiais', regiao: 'inferior', cor: '#c96a2a', mev: 6, mav: 12, mrv: 18 },
    { id: 'gluteo', nome: 'Glúteo', regiao: 'inferior', cor: '#d4568f', mev: 4, mav: 12, mrv: 20 },
    { id: 'adutores', nome: 'Adutores', regiao: 'inferior', cor: '#c8798f', mev: 0, mav: 6, mrv: 12 },
    { id: 'panturrilha', nome: 'Panturrilha', regiao: 'inferior', cor: '#7c9a3c', mev: 6, mav: 12, mrv: 18 }
  ];
  const grupoMap = Object.fromEntries(grupos.map((g) => [g.id, g]));

  /* ---------- Aparelhos e equipamentos ---------- */
  const aparelhos = [
    { id: 'barra', nome: 'Barra reta / olímpica', tipo: 'livre' },
    { id: 'barra-w', nome: 'Barra W', tipo: 'livre' },
    { id: 'barra-hexagonal', nome: 'Barra hexagonal (trap bar)', tipo: 'livre' },
    { id: 'halter', nome: 'Halteres', tipo: 'livre' },
    { id: 'kettlebell', nome: 'Kettlebell', tipo: 'livre' },
    { id: 'anilha', nome: 'Anilha', tipo: 'livre' },
    { id: 'banco', nome: 'Banco (reto / inclinado / declinado)', tipo: 'acessorio' },
    { id: 'scott', nome: 'Banco Scott', tipo: 'acessorio' },
    { id: 'polia', nome: 'Polia / cross over', tipo: 'cabo' },
    { id: 'pulley', nome: 'Pulley (puxada alta)', tipo: 'cabo' },
    { id: 'remada-baixa', nome: 'Remada baixa (polia)', tipo: 'cabo' },
    { id: 'maquina', nome: 'Máquina articulada', tipo: 'maquina' },
    { id: 'smith', nome: 'Smith', tipo: 'maquina' },
    { id: 'leg-press', nome: 'Leg press 45º', tipo: 'maquina' },
    { id: 'leg-horizontal', nome: 'Leg press horizontal', tipo: 'maquina' },
    { id: 'hack', nome: 'Hack machine', tipo: 'maquina' },
    { id: 'extensora', nome: 'Cadeira extensora', tipo: 'maquina' },
    { id: 'flexora', nome: 'Cadeira flexora', tipo: 'maquina' },
    { id: 'mesa-flexora', nome: 'Mesa flexora', tipo: 'maquina' },
    { id: 'abdutora', nome: 'Cadeira abdutora', tipo: 'maquina' },
    { id: 'adutora', nome: 'Cadeira adutora', tipo: 'maquina' },
    { id: 'gluteo-maquina', nome: 'Máquina de glúteo / hip thrust', tipo: 'maquina' },
    { id: 'panturrilha-maquina', nome: 'Máquina de panturrilha', tipo: 'maquina' },
    { id: 'peck-deck', nome: 'Peck deck / voador', tipo: 'maquina' },
    { id: 'graviton', nome: 'Graviton (assistida)', tipo: 'maquina' },
    { id: 'barra-fixa', nome: 'Barra fixa', tipo: 'corporal' },
    { id: 'paralelas', nome: 'Barras paralelas', tipo: 'corporal' },
    { id: 'corporal', nome: 'Peso corporal', tipo: 'corporal' },
    { id: 'trx', nome: 'TRX / fitas de suspensão', tipo: 'corporal' },
    { id: 'elastico', nome: 'Elástico / mini band', tipo: 'acessorio' },
    { id: 'bola', nome: 'Bola suíça', tipo: 'acessorio' },
    { id: 'landmine', nome: 'Landmine', tipo: 'livre' },
    { id: 'gh', nome: 'Banco romano / GHD', tipo: 'acessorio' },
    { id: 'esteira', nome: 'Esteira', tipo: 'cardio' },
    { id: 'bike', nome: 'Bicicleta ergométrica', tipo: 'cardio' },
    { id: 'eliptico', nome: 'Elíptico', tipo: 'cardio' },
    { id: 'escada', nome: 'Escada / stair climber', tipo: 'cardio' },
    { id: 'remo', nome: 'Remo ergômetro', tipo: 'cardio' },
    { id: 'corda', nome: 'Corda de pular', tipo: 'cardio' }
  ];

  /* ---------- Padrões de movimento ---------- */
  const padroes = {
    'empurrar-h': 'Empurrar horizontal', 'empurrar-v': 'Empurrar vertical', 'puxar-h': 'Puxar horizontal',
    'puxar-v': 'Puxar vertical', agachar: 'Agachar', dobradica: 'Dobradiça de quadril', ponte: 'Ponte / extensão de quadril',
    unilateral: 'Unilateral de pernas', isolado: 'Isolado', core: 'Core', carregar: 'Carregar / transportar'
  };

  /* ---------- Exercícios ----------
   * [nome, grupo, aparelho, padrão, tipo (c=composto, i=isolado), unilateral, nível 1–3, secundários, dica]
   */
  const EX = [
    /* Peito */
    ['Supino Reto', 'peito', 'barra', 'empurrar-h', 'c', 0, 2, ['triceps', 'ombro'], 'Escápulas retraídas, pés firmes; barra toca na linha do mamilo.'],
    ['Supino Reto com Halter', 'peito', 'halter', 'empurrar-h', 'c', 0, 1, ['triceps', 'ombro'], 'Maior amplitude que a barra; controle a descida.'],
    ['Supino Inclinado', 'peito', 'barra', 'empurrar-h', 'c', 0, 2, ['ombro', 'triceps'], 'Banco a 30º enfatiza a porção clavicular.'],
    ['Supino Inclinado com Halteres', 'peito', 'halter', 'empurrar-h', 'c', 0, 1, ['ombro', 'triceps'], ''],
    ['Supino Declinado com Halteres', 'peito', 'halter', 'empurrar-h', 'c', 0, 2, ['triceps'], 'Ênfase na porção inferior.'],
    ['Supino Máquina Neutro', 'peito', 'maquina', 'empurrar-h', 'c', 0, 1, ['triceps'], ''],
    ['Supino Articulado Cabo', 'peito', 'maquina', 'empurrar-h', 'c', 0, 1, ['triceps'], 'Bom para drop-sets pela troca rápida de carga.'],
    ['Supino Articulado Inclinado', 'peito', 'maquina', 'empurrar-h', 'c', 0, 1, ['ombro', 'triceps'], ''],
    ['Supino no Smith', 'peito', 'smith', 'empurrar-h', 'c', 0, 1, ['triceps'], ''],
    ['Supino Inclinado no Smith', 'peito', 'smith', 'empurrar-h', 'c', 0, 1, ['ombro', 'triceps'], ''],
    ['Crucifixo Na Máquina', 'peito', 'maquina', 'isolado', 'i', 0, 1, [], ''],
    ['Fly Machine', 'peito', 'maquina', 'isolado', 'i', 0, 1, [], ''],
    ['Voador no Peck Deck', 'peito', 'peck-deck', 'isolado', 'i', 0, 1, [], 'Segure 1–2 s no pico de contração.'],
    ['Crucifixo Reto com Halteres', 'peito', 'halter', 'isolado', 'i', 0, 1, [], 'Cotovelos levemente flexionados, alongue sem forçar o ombro.'],
    ['Crucifixo Inclinado com Halteres', 'peito', 'halter', 'isolado', 'i', 0, 1, [], ''],
    ['Crucifixo Inclinado 30º no Cross', 'peito', 'polia', 'isolado', 'i', 0, 2, [], ''],
    ['Crucifixo no Cross Over Alto', 'peito', 'polia', 'isolado', 'i', 0, 1, [], 'Polias altas: ênfase na porção inferior.'],
    ['Crucifixo no Cross Over Baixo', 'peito', 'polia', 'isolado', 'i', 0, 1, [], 'Polias baixas: ênfase na porção superior.'],
    ['Crucifixo no Cross Over Banco', 'peito', 'polia', 'isolado', 'i', 0, 2, [], ''],
    ['Crucifixo no Cross Over Ajoelhado', 'peito', 'polia', 'isolado', 'i', 0, 2, [], ''],
    ['Crucifixo Unilateral no Cross', 'peito', 'polia', 'isolado', 'i', 1, 2, [], ''],
    ['Flexão de Braços', 'peito', 'corporal', 'empurrar-h', 'c', 0, 1, ['triceps', 'ombro'], 'Corpo alinhado; pode elevar os pés para dificultar.'],
    ['Flexão Declinada', 'peito', 'corporal', 'empurrar-h', 'c', 0, 2, ['ombro', 'triceps'], ''],
    ['Mergulho nas Paralelas (Peito)', 'peito', 'paralelas', 'empurrar-v', 'c', 0, 2, ['triceps', 'ombro'], 'Tronco inclinado à frente para focar o peitoral.'],
    ['Pullover com Halter', 'peito', 'halter', 'isolado', 'i', 0, 2, ['dorsal'], ''],
    ['Supino Pegada Fechada', 'triceps', 'barra', 'empurrar-h', 'c', 0, 2, ['peito', 'ombro'], 'Pegada na largura dos ombros; cotovelos junto ao corpo.'],
    /* Dorsal */
    ['Barra Fixa', 'dorsal', 'barra-fixa', 'puxar-v', 'c', 0, 3, ['biceps'], 'Pronada aberta; puxe o peito à barra.'],
    ['Barra Fixa Supinada', 'dorsal', 'barra-fixa', 'puxar-v', 'c', 0, 2, ['biceps'], ''],
    ['Barra Fixa Neutra', 'dorsal', 'barra-fixa', 'puxar-v', 'c', 0, 2, ['biceps'], ''],
    ['Barra Fixa no Graviton', 'dorsal', 'graviton', 'puxar-v', 'c', 0, 1, ['biceps'], 'Reduza a assistência progressivamente.'],
    ['Pulley Frontal Pronado', 'dorsal', 'pulley', 'puxar-v', 'c', 0, 1, ['biceps'], 'Puxe até a linha do queixo/peito com o tronco levemente inclinado.'],
    ['Pulley Frontal Supinado', 'dorsal', 'pulley', 'puxar-v', 'c', 0, 1, ['biceps'], ''],
    ['Pulley Frontal Pegada Neutra', 'dorsal', 'pulley', 'puxar-v', 'c', 0, 1, ['biceps'], ''],
    ['Pulley Frontal Triângulo', 'dorsal', 'pulley', 'puxar-v', 'c', 0, 1, ['biceps'], ''],
    ['Pulley Romano', 'dorsal', 'pulley', 'puxar-v', 'c', 0, 2, ['biceps'], ''],
    ['Pulley Puxada Unilateral', 'dorsal', 'pulley', 'puxar-v', 'c', 1, 2, ['biceps'], ''],
    ['Puxada Articulada Aberta', 'dorsal', 'maquina', 'puxar-v', 'c', 0, 1, ['biceps'], ''],
    ['Puxada Bilateral no Cross', 'dorsal', 'polia', 'puxar-v', 'c', 0, 2, ['biceps'], ''],
    ['Pulldown Corda', 'dorsal', 'polia', 'isolado', 'i', 0, 1, [], 'Braços estendidos; leve a corda até a coxa.'],
    ['Pulldown Barra Reta', 'dorsal', 'polia', 'isolado', 'i', 0, 1, [], ''],
    ['Remada Articulada', 'dorsal', 'maquina', 'puxar-h', 'c', 0, 1, ['biceps', 'trapezio'], ''],
    ['Remada Articulada em Pé', 'dorsal', 'maquina', 'puxar-h', 'c', 0, 1, ['biceps'], ''],
    ['Remada Máquina Cabo', 'dorsal', 'maquina', 'puxar-h', 'c', 0, 1, ['biceps'], ''],
    ['Remada Máquina Pegada Pronada', 'dorsal', 'maquina', 'puxar-h', 'c', 0, 1, ['trapezio'], ''],
    ['Remada Máquina Unilateral', 'dorsal', 'maquina', 'puxar-h', 'c', 1, 1, ['biceps'], ''],
    ['Remada Baixa Triângulo', 'dorsal', 'remada-baixa', 'puxar-h', 'c', 0, 1, ['biceps'], 'Tronco fixo; puxe o triângulo ao umbigo.'],
    ['Remada Baixa Pronada', 'dorsal', 'remada-baixa', 'puxar-h', 'c', 0, 1, ['trapezio'], ''],
    ['Remada Baixa Supinada', 'dorsal', 'remada-baixa', 'puxar-h', 'c', 0, 1, ['biceps'], ''],
    ['Remada na Polia', 'dorsal', 'polia', 'puxar-h', 'c', 0, 1, ['biceps'], ''],
    ['Remada Unilateral na Polia Baixa', 'dorsal', 'polia', 'puxar-h', 'c', 1, 1, ['biceps'], ''],
    ['Remada Curvada com Barra Reta Pronado', 'dorsal', 'barra', 'puxar-h', 'c', 0, 3, ['lombar', 'biceps'], 'Tronco a ~45º, coluna neutra.'],
    ['Remada Curvada com Barra Reta Supinado', 'dorsal', 'barra', 'puxar-h', 'c', 0, 3, ['biceps', 'lombar'], ''],
    ['Remada Curvada com Halteres Neutro', 'dorsal', 'halter', 'puxar-h', 'c', 0, 2, ['biceps'], ''],
    ['Remada Cavalinho Aberta', 'dorsal', 'barra', 'puxar-h', 'c', 0, 2, ['trapezio'], ''],
    ['Remada Cavalinho Fechada', 'dorsal', 'barra', 'puxar-h', 'c', 0, 2, ['biceps'], ''],
    ['Remada Pegada Alta Supinada', 'dorsal', 'maquina', 'puxar-h', 'c', 0, 1, ['biceps'], ''],
    ['Remada Unilateral (Serrote)', 'dorsal', 'halter', 'puxar-h', 'c', 1, 1, ['biceps'], 'Cotovelo passa a linha do tronco.'],
    ['Remada Serrote com Apoio Alto', 'dorsal', 'halter', 'puxar-h', 'c', 1, 1, ['biceps'], ''],
    ['Remada Unilateral com Halteres no Banco Inclinado', 'dorsal', 'halter', 'puxar-h', 'c', 0, 1, ['trapezio'], ''],
    ['Remada Meadows (Landmine)', 'dorsal', 'landmine', 'puxar-h', 'c', 1, 2, ['biceps'], ''],
    ['Remada com Barra Hexagonal', 'dorsal', 'barra-hexagonal', 'puxar-h', 'c', 0, 2, ['lombar'], ''],
    ['Remada Invertida', 'dorsal', 'corporal', 'puxar-h', 'c', 0, 1, ['biceps'], 'No smith ou TRX; corpo reto.'],
    ['Remada no TRX', 'dorsal', 'trx', 'puxar-h', 'c', 0, 1, ['biceps'], ''],
    ['Levantamento Terra', 'dorsal', 'barra', 'dobradica', 'c', 0, 3, ['gluteo', 'isquiotibiais', 'lombar', 'trapezio'], 'Barra junto à canela; coluna neutra; empurre o chão.'],
    ['Levantamento Terra com Barra Hexagonal', 'dorsal', 'barra-hexagonal', 'dobradica', 'c', 0, 2, ['quadriceps', 'gluteo', 'lombar'], ''],
    ['Crucifixo Inverso Máquina', 'dorsal', 'peck-deck', 'isolado', 'i', 0, 1, ['ombro'], 'Foca deltoide posterior e romboides.'],
    ['Crucifixo Inverso No Cabo', 'dorsal', 'polia', 'isolado', 'i', 0, 1, ['ombro'], ''],
    /* Trapézio / ombro posterior */
    ['Face Pull', 'trapezio', 'polia', 'isolado', 'i', 0, 1, ['ombro'], 'Corda na altura do rosto; abra os cotovelos.'],
    ['Crucifixo Inverso no Cross Over Polia Alta', 'trapezio', 'polia', 'isolado', 'i', 0, 2, ['ombro'], ''],
    ['Encolhimento de Ombros', 'trapezio', 'barra', 'isolado', 'i', 0, 1, [], 'Suba reto, sem rolar os ombros.'],
    ['Encolhimento de Ombros com Halteres', 'trapezio', 'halter', 'isolado', 'i', 0, 1, [], ''],
    ['Trapézio com Halteres', 'trapezio', 'halter', 'isolado', 'i', 0, 1, [], ''],
    ['Trapézio no Smith Pegada Frente', 'trapezio', 'smith', 'isolado', 'i', 0, 1, [], ''],
    ['Trapézio no Smith Pegada Costas', 'trapezio', 'smith', 'isolado', 'i', 0, 1, [], ''],
    ['Encolhimento na Máquina', 'trapezio', 'maquina', 'isolado', 'i', 0, 1, [], ''],
    ['Remada Alta com Halteres', 'trapezio', 'halter', 'puxar-v', 'c', 0, 2, ['ombro'], 'Cotovelos até a linha dos ombros, não acima.'],
    ['Remada Alta na Polia', 'trapezio', 'polia', 'puxar-v', 'c', 0, 1, ['ombro'], ''],
    /* Ombro */
    ['Desenvolvimento Livre Com Halteres', 'ombro', 'halter', 'empurrar-v', 'c', 0, 2, ['triceps'], 'Não trave os cotovelos; core firme.'],
    ['Desenvolvimento com Barra', 'ombro', 'barra', 'empurrar-v', 'c', 0, 3, ['triceps'], ''],
    ['Desenvolvimento Smith Anterior', 'ombro', 'smith', 'empurrar-v', 'c', 0, 1, ['triceps'], ''],
    ['Desenvolvimento Máquina', 'ombro', 'maquina', 'empurrar-v', 'c', 0, 1, ['triceps'], ''],
    ['Desenvolvimento Arnold', 'ombro', 'halter', 'empurrar-v', 'c', 0, 2, ['triceps'], 'Rotação da pegada durante o movimento.'],
    ['Elevação Lateral Com Halter', 'ombro', 'halter', 'isolado', 'i', 0, 1, [], 'Suba com os cotovelos; mindinho levemente acima.'],
    ['Elevação Lateral Com Cabo', 'ombro', 'polia', 'isolado', 'i', 1, 1, [], 'Tensão constante em todo o arco.'],
    ['Elevação Lateral na Máquina', 'ombro', 'maquina', 'isolado', 'i', 0, 1, [], ''],
    ['Elevação Lateral Inclinado', 'ombro', 'halter', 'isolado', 'i', 1, 2, [], 'Apoiado em banco inclinado; maior tensão no início.'],
    ['Elevação Frontal Alternada', 'ombro', 'halter', 'isolado', 'i', 0, 1, [], ''],
    ['Elevação Frontal Halter Neutro', 'ombro', 'halter', 'isolado', 'i', 0, 1, [], ''],
    ['Elevação Frontal Isometria com Halteres', 'ombro', 'halter', 'isolado', 'i', 0, 2, [], 'Mantenha um braço parado a 90º enquanto o outro se move.'],
    ['Elevação Frontal com Anilha', 'ombro', 'anilha', 'isolado', 'i', 0, 1, [], ''],
    ['Elevação Frontal Unilateral na Polia Neutra', 'ombro', 'polia', 'isolado', 'i', 1, 1, [], ''],
    ['Elevação Frontal Unilateral na Polia Pronada', 'ombro', 'polia', 'isolado', 'i', 1, 1, [], ''],
    ['Elevação Frontal Unilateral na Polia Supinada', 'ombro', 'polia', 'isolado', 'i', 1, 1, [], ''],
    ['Crucifixo Inverso com Halteres', 'ombro', 'halter', 'isolado', 'i', 0, 1, ['trapezio'], 'Tronco inclinado; deltoide posterior.'],
    ['Crucifixo Inverso Unilateral na Polia', 'ombro', 'polia', 'isolado', 'i', 1, 1, ['trapezio'], ''],
    ['Crucifixo Inverso no Peck Deck', 'ombro', 'peck-deck', 'isolado', 'i', 0, 1, ['trapezio'], ''],
    ['Manguito Rotador Externo', 'ombro', 'polia', 'isolado', 'i', 1, 1, [], 'Carga leve; cotovelo a 90º junto ao corpo.'],
    ['Manguito Rotador Interno', 'ombro', 'polia', 'isolado', 'i', 1, 1, [], ''],
    ['Elevação em Y no Banco Inclinado', 'ombro', 'halter', 'isolado', 'i', 0, 2, ['trapezio'], ''],
    /* Bíceps */
    ['Rosca Direta', 'biceps', 'barra', 'isolado', 'i', 0, 1, ['antebraco'], 'Cotovelos fixos ao lado do corpo.'],
    ['Rosca Direta Com Barra W', 'biceps', 'barra-w', 'isolado', 'i', 0, 1, ['antebraco'], ''],
    ['Rosca Direta na Polia Baixa', 'biceps', 'polia', 'isolado', 'i', 0, 1, [], ''],
    ['Rosca Direta Banco Inclinado', 'biceps', 'halter', 'isolado', 'i', 0, 2, [], 'Alongamento máximo da cabeça longa.'],
    ['Rosca Direta 21', 'biceps', 'barra-w', 'isolado', 'i', 0, 2, [], '7 parciais baixas + 7 parciais altas + 7 completas.'],
    ['Rosca Alternada', 'biceps', 'halter', 'isolado', 'i', 0, 1, [], 'Supine o punho ao subir.'],
    ['Rosca Concentrada', 'biceps', 'halter', 'isolado', 'i', 1, 1, [], ''],
    ['Rosca Martelo com Halteres', 'biceps', 'halter', 'isolado', 'i', 0, 1, ['antebraco'], 'Ênfase em braquial e braquiorradial.'],
    ['Rosca Martelo na Corda', 'biceps', 'polia', 'isolado', 'i', 0, 1, ['antebraco'], ''],
    ['Rosca Scott com Halteres', 'biceps', 'scott', 'isolado', 'i', 0, 1, [], ''],
    ['Rosca Scott com Halteres Unilateral', 'biceps', 'scott', 'isolado', 'i', 1, 1, [], ''],
    ['Rosca Scott com Barra W', 'biceps', 'scott', 'isolado', 'i', 0, 1, [], ''],
    ['Rosca Scott na Máquina', 'biceps', 'maquina', 'isolado', 'i', 0, 1, [], ''],
    ['Bíceps Corda', 'biceps', 'polia', 'isolado', 'i', 0, 1, [], ''],
    ['Bíceps Sentado', 'biceps', 'halter', 'isolado', 'i', 0, 1, [], ''],
    ['Bíceps no Cabo Baixo', 'biceps', 'polia', 'isolado', 'i', 0, 1, [], ''],
    ['Bíceps no Cabo Unilateral Polia Alta', 'biceps', 'polia', 'isolado', 'i', 1, 2, [], ''],
    ['Bíceps no Cabo Unilateral', 'biceps', 'polia', 'isolado', 'i', 1, 1, [], ''],
    ['Bíceps no Cross Bilateral', 'biceps', 'polia', 'isolado', 'i', 0, 2, [], 'Polias altas, braços abertos em "pose".'],
    ['Rosca Spider', 'biceps', 'halter', 'isolado', 'i', 0, 2, [], 'Peito apoiado no banco inclinado; pico de contração.'],
    ['Rosca Inversa', 'antebraco', 'barra-w', 'isolado', 'i', 0, 1, ['biceps'], ''],
    ['Rosca de Punho', 'antebraco', 'barra', 'isolado', 'i', 0, 1, [], ''],
    ['Rosca de Punho Inversa', 'antebraco', 'barra', 'isolado', 'i', 0, 1, [], ''],
    ['Farmer Walk', 'antebraco', 'halter', 'carregar', 'c', 0, 1, ['trapezio', 'abdomen'], 'Caminhe com carga pesada mantendo postura.'],
    /* Tríceps */
    ['Tríceps Corda', 'triceps', 'polia', 'isolado', 'i', 0, 1, [], 'Abra a corda no final do movimento.'],
    ['Tríceps Reto', 'triceps', 'polia', 'isolado', 'i', 0, 1, [], ''],
    ['Tríceps Reto Invertido', 'triceps', 'polia', 'isolado', 'i', 0, 1, [], 'Pegada supinada.'],
    ['Tríceps na Polia Barra W', 'triceps', 'polia', 'isolado', 'i', 0, 1, [], ''],
    ['Tríceps Testa com Barra W', 'triceps', 'barra-w', 'isolado', 'i', 0, 2, [], 'Desça a barra até a testa/atrás da cabeça; cotovelos fixos.'],
    ['Tríceps Testa com Halteres', 'triceps', 'halter', 'isolado', 'i', 0, 1, [], ''],
    ['Tríceps Testa na Polia Unilateral', 'triceps', 'polia', 'isolado', 'i', 1, 2, [], ''],
    ['Tríceps Testa na Polia', 'triceps', 'polia', 'isolado', 'i', 0, 1, [], ''],
    ['Tríceps Francês Unilateral na Polia', 'triceps', 'polia', 'isolado', 'i', 1, 1, [], 'Braço acima da cabeça: cabeça longa.'],
    ['Tríceps Francês Unilateral no Banco', 'triceps', 'halter', 'isolado', 'i', 1, 1, [], ''],
    ['Tríceps Francês com Halter', 'triceps', 'halter', 'isolado', 'i', 0, 1, [], ''],
    ['Tríceps Francês na Corda', 'triceps', 'polia', 'isolado', 'i', 0, 1, [], ''],
    ['Tríceps Coice Unilateral com Halter', 'triceps', 'halter', 'isolado', 'i', 1, 1, [], ''],
    ['Tríceps Coice Unilateral na Polia Baixa', 'triceps', 'polia', 'isolado', 'i', 1, 1, [], ''],
    ['Tríceps Unilateral Supinado', 'triceps', 'polia', 'isolado', 'i', 1, 1, [], ''],
    ['Tríceps Máquina', 'triceps', 'maquina', 'isolado', 'i', 0, 1, [], ''],
    ['Barra Paralela', 'triceps', 'paralelas', 'empurrar-v', 'c', 0, 2, ['peito', 'ombro'], 'Tronco ereto foca tríceps.'],
    ['Mergulho no Banco', 'triceps', 'banco', 'empurrar-v', 'c', 0, 1, ['ombro'], ''],
    ['Mergulho no Graviton', 'triceps', 'graviton', 'empurrar-v', 'c', 0, 1, ['peito'], ''],
    ['Flexão Diamante', 'triceps', 'corporal', 'empurrar-h', 'c', 0, 2, ['peito'], ''],
    ['Tríceps Testa no Smith', 'triceps', 'smith', 'isolado', 'i', 0, 1, [], ''],
    /* Abdômen / core / lombar */
    ['Abdominais', 'abdomen', 'corporal', 'core', 'i', 0, 1, [], 'Supra no solo; expire ao subir.'],
    ['Abdominal Supra na Máquina', 'abdomen', 'maquina', 'core', 'i', 0, 1, [], ''],
    ['Abdominal Infra na Barra Paralela', 'abdomen', 'paralelas', 'core', 'i', 0, 2, [], 'Elevação de pernas/joelhos com pelve enrolando.'],
    ['Elevação de Pernas na Barra Fixa', 'abdomen', 'barra-fixa', 'core', 'i', 0, 3, [], ''],
    ['Abdominal na Polia (Crunch Ajoelhado)', 'abdomen', 'polia', 'core', 'i', 0, 1, [], ''],
    ['Abdominal Remador', 'abdomen', 'corporal', 'core', 'i', 0, 1, [], ''],
    ['Abdominal Bicicleta', 'abdomen', 'corporal', 'core', 'i', 0, 1, [], ''],
    ['Abdominal Oblíquo', 'abdomen', 'corporal', 'core', 'i', 0, 1, [], ''],
    ['Abdominal Canivete', 'abdomen', 'corporal', 'core', 'i', 0, 2, [], ''],
    ['Prancha', 'abdomen', 'corporal', 'core', 'i', 0, 1, ['lombar'], 'Isometria; quadril alinhado.'],
    ['Prancha Lateral', 'abdomen', 'corporal', 'core', 'i', 1, 1, [], ''],
    ['Rotação de Tronco na Polia (Woodchop)', 'abdomen', 'polia', 'core', 'i', 1, 2, [], ''],
    ['Roda Abdominal (Ab Wheel)', 'abdomen', 'corporal', 'core', 'i', 0, 3, ['lombar'], ''],
    ['Abdominal na Bola Suíça', 'abdomen', 'bola', 'core', 'i', 0, 1, [], ''],
    ['Dead Bug', 'abdomen', 'corporal', 'core', 'i', 0, 1, [], 'Lombar colada ao chão.'],
    ['Extensão Lombar no Banco Romano', 'lombar', 'gh', 'dobradica', 'i', 0, 1, ['gluteo', 'isquiotibiais'], ''],
    ['Good Morning', 'lombar', 'barra', 'dobradica', 'c', 0, 3, ['isquiotibiais', 'gluteo'], 'Carga leve; coluna neutra.'],
    ['Superman', 'lombar', 'corporal', 'core', 'i', 0, 1, ['gluteo'], ''],
    ['Bird Dog', 'lombar', 'corporal', 'core', 'i', 1, 1, ['gluteo'], ''],
    /* Quadríceps */
    ['Agachamento Livre', 'quadriceps', 'barra', 'agachar', 'c', 0, 3, ['gluteo', 'adutores', 'lombar'], 'Barra alta ou baixa; joelhos seguem os pés.'],
    ['Agachamento Frontal', 'quadriceps', 'barra', 'agachar', 'c', 0, 3, ['gluteo', 'abdomen'], 'Tronco mais vertical; ênfase em quadríceps.'],
    ['Agachamento Smith', 'quadriceps', 'smith', 'agachar', 'c', 0, 1, ['gluteo'], 'Pés à frente enfatizam quadríceps.'],
    ['Agachamento Articulado', 'quadriceps', 'maquina', 'agachar', 'c', 0, 1, ['gluteo'], ''],
    ['Agachamento no Hack Machine', 'quadriceps', 'hack', 'agachar', 'c', 0, 1, ['gluteo'], ''],
    ['Agachamento no Hack Invertido', 'quadriceps', 'hack', 'agachar', 'c', 0, 2, ['gluteo'], ''],
    ['Agachamento Goblet', 'quadriceps', 'halter', 'agachar', 'c', 0, 1, ['gluteo', 'abdomen'], 'Halter junto ao peito; ótimo para aprender o padrão.'],
    ['Agachamento Sumô com Halter', 'quadriceps', 'halter', 'agachar', 'c', 0, 1, ['adutores', 'gluteo'], 'Pés abertos, pontas para fora: adutores e glúteo.'],
    ['Agachamento Búlgaro', 'quadriceps', 'halter', 'unilateral', 'c', 1, 2, ['gluteo'], 'Tronco inclinado à frente aumenta glúteo.'],
    ['Agachamento Búlgaro no Smith', 'quadriceps', 'smith', 'unilateral', 'c', 1, 2, ['gluteo'], ''],
    ['Agachamento Lateral Alternado', 'quadriceps', 'halter', 'unilateral', 'c', 1, 2, ['adutores', 'gluteo'], ''],
    ['Agachamento Pistol', 'quadriceps', 'corporal', 'unilateral', 'c', 1, 3, ['gluteo'], ''],
    ['Agachamento Sissy', 'quadriceps', 'corporal', 'isolado', 'i', 0, 2, [], 'Isolamento do reto femoral.'],
    ['Agachamento com Elástico', 'quadriceps', 'elastico', 'agachar', 'c', 0, 1, ['gluteo'], ''],
    ['Agachamento Pendulum', 'quadriceps', 'maquina', 'agachar', 'c', 0, 2, ['gluteo'], ''],
    ['Agachamento Belt Squat', 'quadriceps', 'maquina', 'agachar', 'c', 0, 2, ['gluteo'], 'Sem carga na coluna.'],
    ['Leg Press 45º', 'quadriceps', 'leg-press', 'agachar', 'c', 0, 1, ['gluteo'], 'Pés baixos = quadríceps; pés altos = glúteo/posterior.'],
    ['Leg Press 45º Unilateral', 'quadriceps', 'leg-press', 'unilateral', 'c', 1, 2, ['gluteo'], ''],
    ['Leg Press Articulado', 'quadriceps', 'maquina', 'agachar', 'c', 0, 1, ['gluteo'], ''],
    ['Leg Press Horizontal', 'quadriceps', 'leg-horizontal', 'agachar', 'c', 0, 1, ['gluteo'], ''],
    ['Cadeira Extensora', 'quadriceps', 'extensora', 'isolado', 'i', 0, 1, [], 'Segure 1–2 s no topo.'],
    ['Cadeira Extensora Unilateral', 'quadriceps', 'extensora', 'isolado', 'i', 1, 1, [], ''],
    ['Afundo Halter', 'quadriceps', 'halter', 'unilateral', 'c', 1, 1, ['gluteo'], ''],
    ['Afundo no Smith', 'quadriceps', 'smith', 'unilateral', 'c', 1, 1, ['gluteo'], ''],
    ['Passada', 'quadriceps', 'halter', 'unilateral', 'c', 1, 2, ['gluteo', 'isquiotibiais'], 'Passos longos = mais glúteo; curtos = mais quadríceps.'],
    ['Passada com Barra', 'quadriceps', 'barra', 'unilateral', 'c', 1, 3, ['gluteo'], ''],
    ['Afundo Reverso', 'quadriceps', 'halter', 'unilateral', 'c', 1, 1, ['gluteo'], 'Mais estável e amigo do joelho.'],
    ['Step-up no Banco', 'quadriceps', 'banco', 'unilateral', 'c', 1, 1, ['gluteo'], ''],
    ['Agachamento Búlgaro com Déficit', 'gluteo', 'halter', 'unilateral', 'c', 1, 3, ['quadriceps'], ''],
    /* Ísquiotibiais */
    ['Cadeira Flexora', 'isquiotibiais', 'flexora', 'isolado', 'i', 0, 1, [], 'Sentada: maior alongamento da cabeça longa.'],
    ['Cadeira Flexora Unilateral', 'isquiotibiais', 'flexora', 'isolado', 'i', 1, 1, [], ''],
    ['Mesa Flexora', 'isquiotibiais', 'mesa-flexora', 'isolado', 'i', 0, 1, [], 'Quadril colado ao banco.'],
    ['Mesa Flexora Unilateral', 'isquiotibiais', 'mesa-flexora', 'isolado', 'i', 1, 1, [], ''],
    ['Flexora em Pé', 'isquiotibiais', 'maquina', 'isolado', 'i', 1, 1, [], ''],
    ['Stiff com Halteres', 'isquiotibiais', 'halter', 'dobradica', 'c', 0, 1, ['gluteo', 'lombar'], 'Joelhos semiflexionados; quadril para trás.'],
    ['Stiff com Halteres Unilateral', 'isquiotibiais', 'halter', 'dobradica', 'c', 1, 2, ['gluteo'], ''],
    ['Stiff com Barra', 'isquiotibiais', 'barra', 'dobradica', 'c', 0, 2, ['gluteo', 'lombar'], ''],
    ['Stiff no Smith', 'isquiotibiais', 'smith', 'dobradica', 'c', 0, 1, ['gluteo'], ''],
    ['Stiff Articulado', 'isquiotibiais', 'maquina', 'dobradica', 'c', 0, 1, ['gluteo'], ''],
    ['Stiff na Polia', 'isquiotibiais', 'polia', 'dobradica', 'c', 0, 2, ['gluteo'], ''],
    ['Levantamento Terra Romeno', 'isquiotibiais', 'barra', 'dobradica', 'c', 0, 2, ['gluteo', 'lombar'], 'Desça até sentir o alongamento; barra rente ao corpo.'],
    ['Levantamento Terra Sumô', 'gluteo', 'barra', 'dobradica', 'c', 0, 3, ['adutores', 'quadriceps', 'isquiotibiais'], ''],
    ['Flexão Nórdica', 'isquiotibiais', 'corporal', 'isolado', 'i', 0, 3, [], 'Excêntrica controlada; muito intensa.'],
    ['Flexão de Joelho na Bola Suíça', 'isquiotibiais', 'bola', 'isolado', 'i', 0, 1, ['gluteo'], ''],
    ['Glute Ham Raise', 'isquiotibiais', 'gh', 'isolado', 'c', 0, 3, ['gluteo'], ''],
    /* Glúteo */
    ['Elevação Pélvica', 'gluteo', 'barra', 'ponte', 'c', 0, 1, ['isquiotibiais'], 'Queixo baixo, costelas fechadas; segure 1–2 s no topo.'],
    ['Elevação Pélvica na Máquina', 'gluteo', 'gluteo-maquina', 'ponte', 'c', 0, 1, ['isquiotibiais'], ''],
    ['Elevação Pélvica no Smith', 'gluteo', 'smith', 'ponte', 'c', 0, 1, ['isquiotibiais'], ''],
    ['Elevação Pélvica Unilateral', 'gluteo', 'corporal', 'ponte', 'c', 1, 2, ['isquiotibiais'], ''],
    ['Ponte de Glúteo no Solo', 'gluteo', 'corporal', 'ponte', 'i', 0, 1, [], ''],
    ['Ponte de Glúteo com Elástico', 'gluteo', 'elastico', 'ponte', 'i', 0, 1, [], 'Abra os joelhos contra o elástico no topo.'],
    ['Cadeira Abdutora', 'gluteo', 'abdutora', 'isolado', 'i', 0, 1, [], 'Tronco inclinado à frente ativa mais o glúteo máximo.'],
    ['Abdução de Quadril na Polia', 'gluteo', 'polia', 'isolado', 'i', 1, 1, [], ''],
    ['Abdução de Quadril com Elástico', 'gluteo', 'elastico', 'isolado', 'i', 1, 1, [], ''],
    ['Abdução Lateral Deitado', 'gluteo', 'corporal', 'isolado', 'i', 1, 1, [], ''],
    ['Glúteo Coice na Polia com Flexão de Joelho', 'gluteo', 'polia', 'isolado', 'i', 1, 1, [], ''],
    ['Glúteo Coice na Polia Perna Estendida', 'gluteo', 'polia', 'isolado', 'i', 1, 1, [], ''],
    ['Glúteo Coice na Máquina', 'gluteo', 'gluteo-maquina', 'isolado', 'i', 1, 1, [], ''],
    ['Glúteo 4 Apoios', 'gluteo', 'corporal', 'isolado', 'i', 1, 1, [], 'Pode usar caneleira ou elástico.'],
    ['Glúteo 4 Apoios com Caneleira', 'gluteo', 'corporal', 'isolado', 'i', 1, 1, [], ''],
    ['Extensão de Quadril no Banco Romano', 'gluteo', 'gh', 'dobradica', 'i', 0, 1, ['isquiotibiais'], 'Costas arredondadas e queixo baixo focam o glúteo.'],
    ['Agachamento Sumô na Polia', 'gluteo', 'polia', 'agachar', 'c', 0, 1, ['adutores', 'quadriceps'], ''],
    ['Pull-through na Polia', 'gluteo', 'polia', 'dobradica', 'c', 0, 1, ['isquiotibiais'], ''],
    ['Kickback no Smith', 'gluteo', 'smith', 'isolado', 'i', 1, 2, [], ''],
    ['Frog Pump', 'gluteo', 'corporal', 'ponte', 'i', 0, 1, [], 'Altas repetições; pés unidos.'],
    ['Monster Walk com Elástico', 'gluteo', 'elastico', 'carregar', 'i', 0, 1, [], 'Ativação de glúteo médio.'],
    ['Cadeira Adutora', 'adutores', 'adutora', 'isolado', 'i', 0, 1, [], ''],
    ['Adução de Quadril na Polia', 'adutores', 'polia', 'isolado', 'i', 1, 1, [], ''],
    ['Agachamento Cossaco', 'adutores', 'corporal', 'unilateral', 'c', 1, 2, ['quadriceps', 'gluteo'], ''],
    /* Panturrilha */
    ['Panturrilha Sentado Máquina', 'panturrilha', 'panturrilha-maquina', 'isolado', 'i', 0, 1, [], 'Sentado: sóleo. Pause embaixo, sem quicar.'],
    ['Panturrilha em Pé na Máquina', 'panturrilha', 'panturrilha-maquina', 'isolado', 'i', 0, 1, [], 'Em pé: gastrocnêmio.'],
    ['Panturrilha Unilateral em Pé', 'panturrilha', 'halter', 'isolado', 'i', 1, 1, [], ''],
    ['Panturrilha no Leg', 'panturrilha', 'leg-press', 'isolado', 'i', 0, 1, [], ''],
    ['Panturrilha no Hack Invertido', 'panturrilha', 'hack', 'isolado', 'i', 0, 1, [], ''],
    ['Panturrilha Livre', 'panturrilha', 'corporal', 'isolado', 'i', 0, 1, [], ''],
    ['Panturrilha no Smith', 'panturrilha', 'smith', 'isolado', 'i', 0, 1, [], 'Use um step para amplitude completa.'],
    ['Panturrilha Burrinho', 'panturrilha', 'maquina', 'isolado', 'i', 0, 1, [], ''],
    ['Tibial Anterior', 'panturrilha', 'corporal', 'isolado', 'i', 0, 1, [], 'Equilíbrio para a canela; previne dores.']
  ];

  const exercicios = EX.map((e) => ({
    id: slug(e[0]), nome: e[0], grupo: e[1], aparelho: e[2], padrao: e[3], tipo: e[4] === 'c' ? 'composto' : 'isolado',
    unilateral: !!e[5], nivel: e[6], secundarios: e[7] || [], dica: e[8] || ''
  }));

  /* Sinônimos da planilha (nome antigo → id) */
  const exercicioAlias = {
    'Panturilha no Leg': 'panturrilha-no-leg',
    'Bíceps no Cabo Unilateral': 'biceps-no-cabo-unilateral',
    'Rosca Direta': 'rosca-direta'
  };

  /* ---------- Metodologias / técnicas ---------- */
  const metodos = [
    { id: 'normal', nome: 'Séries diretas', cat: 'base', desc: 'Séries convencionais com descanso completo entre elas.', como: 'Mesma carga em todas as séries, parando a 1–3 reps da falha (RIR 1–3).', ex: '4 × 12-15' },
    { id: 'progressao-carga', nome: 'Progressão de carga (pirâmide crescente)', cat: 'intensidade', desc: 'Aumenta a carga a cada série enquanto as repetições caem.', como: 'Ex.: 20 × 15 × 12 × 12 × 12 subindo a carga. A primeira série serve de aquecimento.', ex: '20x15x12x12x12' },
    { id: 'progressao-drops', nome: 'Progressão de carga com 2 drops na última', cat: 'intensidade', desc: 'Pirâmide crescente; na última série, ao falhar, reduz a carga duas vezes sem descanso.', como: 'Após a última série, tire ~20 % da carga e vá até a falha, repita mais uma vez.', ex: '20x15x12x12x12 + 2 drops' },
    { id: 'piramide-decrescente', nome: 'Pirâmide decrescente', cat: 'intensidade', desc: 'Começa pesado e vai reduzindo carga e aumentando repetições.', como: 'Ex.: 6 × 8 × 10 × 12 × 15 com carga decrescente.', ex: '6x8x10x12x15' },
    { id: 'drop-set', nome: 'Drop-set', cat: 'intensidade', desc: 'Ao atingir a falha, reduz a carga (~20–30 %) e continua sem descanso.', como: 'Use em máquinas ou halteres para trocar a carga rápido. 1–2 quedas.', ex: '3 × 12 + drop' },
    { id: 'super-drop', nome: 'Super drop-set', cat: 'intensidade', desc: 'Série única com múltiplas quedas de carga sem descanso.', como: 'Ex.: 10 × 10 × 10 × 10 × 10 × 10 descendo o halter a cada bloco.', ex: '10x10x10x10x10x10' },
    { id: 'drop-mecanico', nome: 'Drop-set mecânico', cat: 'intensidade', desc: 'Ao falhar, muda para uma variação mecanicamente mais fácil do mesmo exercício.', como: 'Ex.: elevação lateral em pé → inclinada → parciais.', ex: '3 amplitudes' },
    { id: 'rest-pause', nome: 'Rest-pause', cat: 'intensidade', desc: 'Pausas curtas (10–20 s) dentro da série para alongar o número de repetições com carga alta.', como: 'Ex.: 1 × 10 s na 2ª e 3ª e 2 × 10 s na 4ª série. Mantém a mesma carga.', ex: '4 × 8 (RP 10 s)' },
    { id: 'myo-reps', nome: 'Myo-reps', cat: 'intensidade', desc: 'Série de ativação (12–20 reps perto da falha) seguida de mini-séries de 3–5 reps com 5 respirações de pausa.', como: 'Ativação + 4–5 mini-séries. Ótimo para isoladores e máquinas.', ex: '15 + 5×4' },
    { id: 'cluster', nome: 'Cluster set', cat: 'forca', desc: 'Repetições agrupadas com micro-pausas intra-série para manter a qualidade com carga alta.', como: 'Ex.: 5 blocos de 2 reps com 15–20 s entre eles, carga de 85–90 %.', ex: '5 × (2+2+2)' },
    { id: 'bi-set', nome: 'Bi-set', cat: 'densidade', desc: 'Dois exercícios do mesmo grupo em sequência, sem descanso.', como: 'Ex.: crucifixo + supino; descanse apenas após o segundo.', ex: 'A1 + A2' },
    { id: 'tri-set', nome: 'Tri-set', cat: 'densidade', desc: 'Três exercícios do mesmo grupo em sequência, sem descanso.', como: 'Ex.: elevação lateral + frontal + desenvolvimento.', ex: 'A1 + A2 + A3' },
    { id: 'super-set', nome: 'Super set antagonista', cat: 'densidade', desc: 'Dois exercícios de grupos opostos alternados (peito/costas, bíceps/tríceps).', como: 'Descanso reduzido; ideal para economizar tempo sem perder desempenho.', ex: 'Supino + Remada' },
    { id: 'giant-set', nome: 'Giant set', cat: 'densidade', desc: 'Quatro ou mais exercícios em sequência para o mesmo grupo.', como: 'Cargas moderadas; altíssimo estresse metabólico.', ex: '4+ exercícios' },
    { id: 'circuito', nome: 'Circuito', cat: 'densidade', desc: 'Sequência de estações para o corpo todo com pouco descanso.', como: '8–12 exercícios, 30–45 s cada, 2–4 voltas.', ex: '3 voltas' },
    { id: 'fst-7', nome: 'FST-7', cat: 'volume', desc: 'Sete séries de 8–12 reps com 30–45 s de descanso no último exercício do grupo (fáscia stretch).', como: 'Use isoladores; mantenha a carga fixa.', ex: '7 × 10' },
    { id: 'gvt', nome: 'GVT 10×10 (German Volume)', cat: 'volume', desc: 'Dez séries de dez repetições com ~60 % de 1RM e 60–90 s de descanso.', como: 'Um exercício composto por grupo; só aumente a carga quando completar 10×10.', ex: '10 × 10' },
    { id: '5x5', nome: '5×5', cat: 'forca', desc: 'Cinco séries de cinco repetições com carga fixa (~80–85 % de 1RM).', como: 'Progressão linear: +2,5 kg quando completar as 25 reps.', ex: '5 × 5' },
    { id: '531', nome: '5/3/1', cat: 'forca', desc: 'Ondas semanais de 5, 3 e 1+ repetições com percentuais do 1RM de treino (90 % do máximo).', como: 'Sem.1: 65/75/85 % ×5; Sem.2: 70/80/90 % ×3; Sem.3: 75/85/95 % ×5/3/1+; Sem.4: deload.', ex: '3 × 5/3/1+' },
    { id: 'ate-falha', nome: 'Até a falha', cat: 'intensidade', desc: 'Todas as repetições possíveis (RIR 0).', como: 'Use em exercícios seguros (máquinas, peso corporal).', ex: 'AMRAP' },
    { id: 'parciais', nome: 'Reps completas + parciais', cat: 'intensidade', desc: 'Completa as repetições e continua com parciais no arco mais forte.', como: 'Ex.: 10 completas + 5 parciais. Ou parciais nas 5 últimas.', ex: '10+5' },
    { id: '21', nome: 'Bíceps 21', cat: 'intensidade', desc: 'Sete parciais na metade baixa, sete na metade alta e sete completas.', como: 'Carga ~50 % da rosca direta usual.', ex: '7x7x7' },
    { id: 'pico-contracao', nome: 'Pico de contração (2 s)', cat: 'tecnica', desc: 'Segura 2 segundos no ponto de maior encurtamento.', como: 'Reduz a carga em ~15 %. Ótimo em extensora, flexora, crucifixo e pulldown.', ex: '4 × 12 (2 s)' },
    { id: 'isometria', nome: 'Isometria', cat: 'tecnica', desc: 'Mantém a posição parada por tempo determinado.', como: 'Ex.: 10 seguidas + 5 segurando 3 s; ou prancha por tempo.', ex: '10 + 5 (3 s)' },
    { id: 'excentrica', nome: 'Ênfase excêntrica / negativas', cat: 'tecnica', desc: 'Descida lenta (3–5 s) com carga acima do concêntrico habitual.', como: 'Com parceiro ou em máquinas. Muito danosa: 1× por semana por grupo.', ex: '4 × 6 (4 s desc.)' },
    { id: 'tempo', nome: 'Cadência controlada (tempo)', cat: 'tecnica', desc: 'Prescrição de tempo em cada fase, ex. 3-1-1-0 (excêntrica-pausa-concêntrica-pausa).', como: 'Aumenta tempo sob tensão sem aumentar a carga.', ex: '3 × 10 @3-1-1-0' },
    { id: 'amplitudes', nome: '3 amplitudes', cat: 'tecnica', desc: 'Divide a série em três faixas de amplitude: completa, curta alta e curta baixa.', como: 'Ex.: 10 completas + 5 curtas altas + 5 curtas baixas + 5 completas.', ex: '10+5+5+5' },
    { id: 'inclinacoes', nome: '3 inclinações / 3 posições', cat: 'tecnica', desc: 'Mesma série repetida em três ângulos ou posições de pé (dentro, fora, neutro).', como: 'Ex.: elevação lateral 7×7×7 em três inclinações; panturrilha com pés em 3 posições.', ex: '7x7x7' },
    { id: 'pre-exaustao', nome: 'Pré-exaustão', cat: 'ordem', desc: 'Isolador antes do composto para o alvo falhar primeiro.', como: 'Ex.: crucifixo → supino; extensora → agachamento.', ex: 'Isolado → Composto' },
    { id: 'pos-exaustao', nome: 'Pós-exaustão', cat: 'ordem', desc: 'Composto pesado seguido de isolador leve do mesmo grupo.', como: 'Ex.: supino → crucifixo no cross.', ex: 'Composto → Isolado' },
    { id: 'aquecimento', nome: 'Aquecimento (20 reps na primeira)', cat: 'base', desc: 'Primeira série leve com 20–30 reps para preparar a articulação.', como: 'Não conta como série efetiva.', ex: '20 (aq.) + 3 × 12' },
    { id: 'back-off', nome: 'Back-off set', cat: 'forca', desc: 'Após séries pesadas, uma série leve (−15–20 %) com mais repetições.', como: 'Ex.: 3 × 5 pesado + 1 × 12 leve.', ex: '3×5 + 1×12' },
    { id: 'ondulatorio', nome: 'Ondulatório diário (DUP)', cat: 'periodizacao', desc: 'Varia faixa de repetições dentro da semana (pesado / moderado / leve).', como: 'Ex.: Seg 5 reps, Qua 10 reps, Sex 15 reps no mesmo exercício.', ex: '5 / 10 / 15' },
    { id: 'emom', nome: 'EMOM', cat: 'condicionamento', desc: 'A cada minuto, executa a quantidade prescrita e descansa o restante.', como: 'Ex.: 10 min × 8 kettlebell swings.', ex: '10 min' },
    { id: 'amrap', nome: 'AMRAP', cat: 'condicionamento', desc: 'Máximo de voltas em um tempo fixo.', como: 'Ex.: 12 min: 10 agachamentos, 8 flexões, 6 remadas.', ex: '12 min' },
    { id: 'tabata', nome: 'Tabata / HIIT', cat: 'condicionamento', desc: '20 s forte / 10 s descanso, 8 ciclos (4 min) por bloco.', como: 'Bike, corrida, corda ou peso corporal.', ex: '8 × 20/10' },
    { id: 'densidade', nome: 'Treino de densidade', cat: 'densidade', desc: 'Mais trabalho no mesmo tempo: descansos encurtam a cada semana.', como: 'Semana 1: 90 s; 2: 75 s; 3: 60 s; 4: 45 s.', ex: '↓ descanso' },
    { id: 'ida-volta', nome: 'Ida e volta', cat: 'base', desc: 'Exercício de deslocamento contado por trajeto (passada, farmer walk).', como: 'Ex.: 3 idas e voltas de 10 m.', ex: '3 × ida e volta' }
  ];

  /* ---------- Divisões de treino ---------- */
  const divisoes = [
    { id: 'fullbody', nome: 'Full Body', freq: [2, 3], nivel: 1, fichas: [
      { letra: 'A', nome: 'Corpo inteiro A', grupos: ['quadriceps', 'peito', 'dorsal', 'ombro', 'isquiotibiais', 'abdomen'] },
      { letra: 'B', nome: 'Corpo inteiro B', grupos: ['isquiotibiais', 'gluteo', 'dorsal', 'peito', 'biceps', 'triceps'] },
      { letra: 'C', nome: 'Corpo inteiro C', grupos: ['quadriceps', 'ombro', 'dorsal', 'peito', 'panturrilha', 'abdomen'] }
    ] },
    { id: 'ab', nome: 'AB (superior / inferior)', freq: [2, 4], nivel: 1, fichas: [
      { letra: 'A', nome: 'Superiores', grupos: ['peito', 'dorsal', 'ombro', 'biceps', 'triceps'] },
      { letra: 'B', nome: 'Inferiores', grupos: ['quadriceps', 'isquiotibiais', 'gluteo', 'panturrilha', 'abdomen'] }
    ] },
    { id: 'upper-lower', nome: 'Upper / Lower (4×)', freq: [4, 4], nivel: 2, fichas: [
      { letra: 'A', nome: 'Upper força', grupos: ['peito', 'dorsal', 'ombro', 'triceps', 'biceps'] },
      { letra: 'B', nome: 'Lower força', grupos: ['quadriceps', 'isquiotibiais', 'gluteo', 'panturrilha'] },
      { letra: 'C', nome: 'Upper hipertrofia', grupos: ['dorsal', 'peito', 'ombro', 'biceps', 'triceps', 'trapezio'] },
      { letra: 'D', nome: 'Lower hipertrofia', grupos: ['gluteo', 'isquiotibiais', 'quadriceps', 'panturrilha', 'abdomen'] }
    ] },
    { id: 'abc', nome: 'ABC', freq: [3, 6], nivel: 1, fichas: [
      { letra: 'A', nome: 'Peito, tríceps e ombro', grupos: ['peito', 'triceps', 'ombro'] },
      { letra: 'B', nome: 'Costas, bíceps e trapézio', grupos: ['dorsal', 'biceps', 'trapezio'] },
      { letra: 'C', nome: 'Inferiores', grupos: ['quadriceps', 'isquiotibiais', 'gluteo', 'panturrilha', 'abdomen'] }
    ] },
    { id: 'ppl', nome: 'Push / Pull / Legs', freq: [3, 6], nivel: 2, fichas: [
      { letra: 'A', nome: 'Push (peito, ombro, tríceps)', grupos: ['peito', 'ombro', 'triceps'] },
      { letra: 'B', nome: 'Pull (costas, bíceps, posterior de ombro)', grupos: ['dorsal', 'trapezio', 'biceps'] },
      { letra: 'C', nome: 'Legs (pernas e core)', grupos: ['quadriceps', 'isquiotibiais', 'gluteo', 'panturrilha', 'abdomen'] }
    ] },
    { id: 'abcd', nome: 'ABCD', freq: [4, 4], nivel: 2, fichas: [
      { letra: 'A', nome: 'Peito e tríceps', grupos: ['peito', 'triceps'] },
      { letra: 'B', nome: 'Costas e bíceps', grupos: ['dorsal', 'trapezio', 'biceps'] },
      { letra: 'C', nome: 'Inferiores', grupos: ['quadriceps', 'isquiotibiais', 'gluteo', 'panturrilha'] },
      { letra: 'D', nome: 'Ombro, trapézio e abdômen', grupos: ['ombro', 'trapezio', 'abdomen', 'antebraco'] }
    ] },
    { id: 'abcde', nome: 'ABCDE (5×)', freq: [5, 5], nivel: 2, fichas: [
      { letra: 'A', nome: 'Costas, bíceps e trapézio', grupos: ['dorsal', 'biceps', 'trapezio'] },
      { letra: 'B', nome: 'Peito, tríceps e ombro', grupos: ['peito', 'triceps', 'ombro'] },
      { letra: 'C', nome: 'Inferiores', grupos: ['quadriceps', 'isquiotibiais', 'gluteo', 'panturrilha'] },
      { letra: 'D', nome: 'Costas e peito', grupos: ['dorsal', 'peito', 'trapezio'] },
      { letra: 'E', nome: 'Inferiores e ombro', grupos: ['isquiotibiais', 'gluteo', 'quadriceps', 'ombro', 'abdomen'] }
    ] },
    { id: 'abcdef', nome: 'ABCDEF (6×)', freq: [6, 6], nivel: 3, fichas: [
      { letra: 'A', nome: 'Inferiores (quadríceps)', grupos: ['quadriceps', 'gluteo', 'panturrilha', 'abdomen'] },
      { letra: 'B', nome: 'Peito, tríceps e ombro', grupos: ['peito', 'triceps', 'ombro'] },
      { letra: 'C', nome: 'Costas, bíceps e trapézio', grupos: ['dorsal', 'biceps', 'trapezio'] },
      { letra: 'D', nome: 'Inferiores (posterior e glúteo)', grupos: ['isquiotibiais', 'gluteo', 'quadriceps', 'panturrilha'] },
      { letra: 'E', nome: 'Ombro, peito e tríceps', grupos: ['ombro', 'peito', 'triceps', 'abdomen'] },
      { letra: 'F', nome: 'Costas, bíceps e antebraço', grupos: ['dorsal', 'trapezio', 'biceps', 'antebraco'] }
    ] },
    { id: 'pplul', nome: 'PPL + Upper / Lower (5×)', freq: [5, 5], nivel: 3, fichas: [
      { letra: 'A', nome: 'Push', grupos: ['peito', 'ombro', 'triceps'] },
      { letra: 'B', nome: 'Pull', grupos: ['dorsal', 'trapezio', 'biceps'] },
      { letra: 'C', nome: 'Legs', grupos: ['quadriceps', 'isquiotibiais', 'gluteo', 'panturrilha'] },
      { letra: 'D', nome: 'Upper', grupos: ['peito', 'dorsal', 'ombro', 'biceps', 'triceps'] },
      { letra: 'E', nome: 'Lower', grupos: ['gluteo', 'isquiotibiais', 'quadriceps', 'panturrilha', 'abdomen'] }
    ] },
    { id: 'gluteo-foco', nome: 'Ênfase em glúteo e inferiores (3 inferiores + 2 superiores)', freq: [5, 5], nivel: 2, sexo: 'F', fichas: [
      { letra: 'A', nome: 'Glúteo e posterior', grupos: ['gluteo', 'isquiotibiais', 'adutores', 'panturrilha'] },
      { letra: 'B', nome: 'Superiores (costas e ombro)', grupos: ['dorsal', 'ombro', 'biceps', 'abdomen'] },
      { letra: 'C', nome: 'Quadríceps e glúteo', grupos: ['quadriceps', 'gluteo', 'panturrilha', 'abdomen'] },
      { letra: 'D', nome: 'Superiores (peito e braços)', grupos: ['peito', 'ombro', 'triceps', 'dorsal'] },
      { letra: 'E', nome: 'Glúteo completo', grupos: ['gluteo', 'isquiotibiais', 'quadriceps', 'adutores'] }
    ] },
    { id: 'inferior-3-superior-1', nome: 'Inferiores 3× + superiores 1× (4×)', freq: [4, 4], nivel: 1, sexo: 'F', fichas: [
      { letra: 'A', nome: 'Glúteo e posterior', grupos: ['gluteo', 'isquiotibiais', 'panturrilha', 'abdomen'] },
      { letra: 'B', nome: 'Superiores completo', grupos: ['dorsal', 'peito', 'ombro', 'triceps', 'biceps'] },
      { letra: 'C', nome: 'Quadríceps e glúteo', grupos: ['quadriceps', 'gluteo', 'adutores', 'panturrilha'] },
      { letra: 'D', nome: 'Glúteo e inferiores geral', grupos: ['gluteo', 'isquiotibiais', 'quadriceps', 'abdomen'] }
    ] }
  ];

  /* ---------- Fases de mesociclo ---------- */
  const fases = {
    adaptacao: { nome: 'Adaptação anatômica', reps: [12, 20], rir: 3, series: 2.5, descanso: 60, intensidade: [50, 65], desc: 'Aprender o padrão, preparar tendões e articulações. Cargas leves, técnica impecável.' },
    hipertrofia: { nome: 'Hipertrofia', reps: [8, 15], rir: 1.5, series: 4, descanso: 75, intensidade: [65, 80], desc: 'Volume alto, perto da falha, técnicas de intensidade nos isoladores.' },
    'hipertrofia-metabolica': { nome: 'Hipertrofia metabólica', reps: [12, 20], rir: 1, series: 4, descanso: 45, intensidade: [55, 70], desc: 'Descansos curtos, drop-sets, bi-sets e FST-7. Alto estresse metabólico.' },
    forca: { nome: 'Força', reps: [3, 6], rir: 2, series: 4, descanso: 150, intensidade: [80, 92], desc: 'Compostos pesados, poucas repetições, descansos longos.' },
    potencia: { nome: 'Potência', reps: [3, 5], rir: 3, series: 4, descanso: 150, intensidade: [50, 75], desc: 'Velocidade de execução; saltos, arremessos, cluster sets.' },
    resistencia: { nome: 'Resistência muscular', reps: [15, 25], rir: 2, series: 3, descanso: 40, intensidade: [45, 60], desc: 'Circuitos e altas repetições. Bom em cutting agressivo.' },
    intensificacao: { nome: 'Intensificação', reps: [6, 10], rir: 0.5, series: 3, descanso: 120, intensidade: [75, 85], desc: 'Volume cai e intensidade sobe. Rest-pause e cluster nos compostos.' },
    deload: { nome: 'Deload', reps: [10, 15], rir: 4, series: 2, descanso: 90, intensidade: [50, 60], desc: 'Semana de recuperação: metade do volume, cargas leves.' }
  };

  /* Modelos de macrociclo (sequência de mesociclos) por objetivo e nível */
  const modelosMacro = [
    { id: 'bulking-iniciante', objetivo: 'bulking', nivel: 1, nome: 'Bulking iniciante (12 sem.)', mesos: [['adaptacao', 3], ['hipertrofia', 4], ['deload', 1], ['hipertrofia', 3], ['deload', 1]] },
    { id: 'bulking-intermediario', objetivo: 'bulking', nivel: 2, nome: 'Bulking intermediário (16 sem.)', mesos: [['hipertrofia', 5], ['deload', 1], ['forca', 4], ['deload', 1], ['hipertrofia-metabolica', 4], ['deload', 1]] },
    { id: 'bulking-avancado', objetivo: 'bulking', nivel: 3, nome: 'Bulking avançado (20 sem.)', mesos: [['hipertrofia', 5], ['deload', 1], ['intensificacao', 3], ['deload', 1], ['hipertrofia-metabolica', 4], ['deload', 1], ['forca', 4], ['deload', 1]] },
    { id: 'cutting-iniciante', objetivo: 'cutting', nivel: 1, nome: 'Cutting iniciante (10 sem.)', mesos: [['adaptacao', 2], ['hipertrofia', 4], ['deload', 1], ['resistencia', 3]] },
    { id: 'cutting-intermediario', objetivo: 'cutting', nivel: 2, nome: 'Cutting intermediário (12 sem.)', mesos: [['hipertrofia', 4], ['deload', 1], ['hipertrofia-metabolica', 4], ['deload', 1], ['intensificacao', 2]] },
    { id: 'cutting-avancado', objetivo: 'cutting', nivel: 3, nome: 'Cutting avançado (16 sem.)', mesos: [['hipertrofia', 4], ['deload', 1], ['intensificacao', 3], ['deload', 1], ['hipertrofia-metabolica', 5], ['deload', 1], ['resistencia', 1]] },
    { id: 'manutencao', objetivo: 'manutencao', nivel: 2, nome: 'Manutenção / recomposição (12 sem.)', mesos: [['hipertrofia', 4], ['deload', 1], ['forca', 3], ['deload', 1], ['hipertrofia-metabolica', 3]] },
    { id: 'forca', objetivo: 'forca', nivel: 2, nome: 'Bloco de força (12 sem.)', mesos: [['hipertrofia', 3], ['deload', 1], ['forca', 4], ['deload', 1], ['intensificacao', 2], ['deload', 1]] }
  ];

  /* Microciclo: progressão semanal dentro de um meso (relativo à semana 1) */
  const progressaoMicro = {
    padrao: [
      { semana: 1, volume: 0.85, rir: 1, carga: 0, nome: 'Introdução' },
      { semana: 2, volume: 1.0, rir: 0.5, carga: 2.5, nome: 'Acúmulo' },
      { semana: 3, volume: 1.1, rir: 0, carga: 5, nome: 'Acúmulo +' },
      { semana: 4, volume: 1.2, rir: 0, carga: 7.5, nome: 'Sobrecarga' },
      { semana: 5, volume: 1.25, rir: -0.5, carga: 10, nome: 'Choque' },
      { semana: 6, volume: 1.3, rir: -0.5, carga: 10, nome: 'Choque +' }
    ],
    deload: [{ semana: 1, volume: 0.5, rir: 3, carga: -15, nome: 'Deload' }]
  };

  /* ---------- Nível de atividade ---------- */
  const fatoresAtividade = [
    { id: 'sedentario', nome: 'Sedentário (pouco ou nenhum exercício)', fator: 1.2 },
    { id: 'leve', nome: 'Leve (1–3 treinos/semana)', fator: 1.375 },
    { id: 'moderado', nome: 'Moderado (3–5 treinos/semana)', fator: 1.55 },
    { id: 'intenso', nome: 'Intenso (6–7 treinos/semana)', fator: 1.725 },
    { id: 'muito-intenso', nome: 'Muito intenso (2× por dia / trabalho físico)', fator: 1.9 }
  ];

  const objetivos = [
    { id: 'bulking', nome: 'Bulking (ganho de massa)', ajuste: 10, macros: { c: 60, g: 16, p: 24 } },
    { id: 'cutting', nome: 'Cutting (perda de gordura)', ajuste: -15, macros: { c: 35, g: 27, p: 38 } },
    { id: 'manutencao', nome: 'Manutenção / recomposição', ajuste: 0, macros: { c: 45, g: 25, p: 30 } },
    { id: 'forca', nome: 'Força', ajuste: 5, macros: { c: 50, g: 25, p: 25 } }
  ];

  const presetsMacro = [
    { id: 'planilha-bulking', nome: 'Planilha — Bulking (60/16/24)', c: 60, g: 16, p: 24 },
    { id: 'planilha-cutting', nome: 'Planilha — Cutting (35/27/38)', c: 35, g: 27, p: 38 },
    { id: 'equilibrado', nome: 'Equilibrado (45/25/30)', c: 45, g: 25, p: 30 },
    { id: 'alto-carbo', nome: 'Alto carboidrato (55/20/25)', c: 55, g: 20, p: 25 },
    { id: 'low-carb', nome: 'Low carb (20/45/35)', c: 20, g: 45, p: 35 },
    { id: 'alta-proteina', nome: 'Alta proteína (40/20/40)', c: 40, g: 20, p: 40 }
  ];

  /* ---------- Alimentos (por 100 g / 100 ml) ----------
   * [nome, categoria, C, G, P, fibras, medidas caseiras {nome: gramas}]
   * Fonte: TACO (4ª ed.), rótulos e USDA — valores aproximados.
   */
  const AL = [
    /* Cereais, pães e massas */
    ['arroz', 'cereais', 28.1, 0.2, 2.5, 3.0, { 'colher de sopa cheia': 25, 'escumadeira': 90, 'xícara': 160 }],
    ['arroz integral', 'cereais', 25.8, 1.0, 2.6, 3.0, { 'colher de sopa cheia': 25, 'escumadeira': 90 }],
    ['arroz cru', 'cereais', 78.8, 0.3, 7.2, 1.6, { 'xícara': 200 }],
    ['macarrão cozido', 'cereais', 30.0, 0.6, 5.0, 1.8, { 'pegador': 110, 'prato raso': 220 }],
    ['macarrão integral cozido', 'cereais', 26.5, 1.0, 5.3, 4.0, { 'pegador': 110 }],
    ['macarrão cru', 'cereais', 74.0, 1.5, 12.0, 2.9, { 'porção': 80 }],
    ['pão', 'cereais', 38.3, 2.3, 9.3, 6.5, { 'fatia': 25, 'pão francês': 50 }],
    ['pão francês', 'cereais', 58.6, 3.1, 8.0, 2.3, { 'unidade': 50 }],
    ['pão integral', 'cereais', 43.0, 3.5, 9.4, 6.9, { 'fatia': 25 }],
    ['pão de forma', 'cereais', 49.0, 3.3, 8.0, 2.5, { 'fatia': 25 }],
    ['pão sírio', 'cereais', 55.0, 1.2, 9.0, 2.0, { 'unidade': 50 }],
    ['tapioca (goma hidratada)', 'cereais', 60.0, 0.1, 0.3, 0.5, { 'colher de sopa': 20, 'unidade média': 80 }],
    ['cuscuz de milho', 'cereais', 25.3, 0.7, 2.2, 2.1, { 'fatia': 100 }],
    ['aveia', 'cereais', 43.3, 6.7, 13.3, 23.3, { 'colher de sopa': 15, 'xícara': 80 }],
    ['granola', 'cereais', 6.7, 49.6, 27.0, 5.0, { 'colher de sopa': 15 }],
    ['granola tradicional', 'cereais', 64.0, 9.0, 10.0, 6.0, { 'colher de sopa': 15 }],
    ['batata', 'cereais', 11.9, 0.1, 1.8, 1.5, { 'unidade média': 140, 'colher de sopa': 30 }],
    ['batata-doce cozida', 'cereais', 18.4, 0.1, 0.6, 2.2, { 'fatia': 60, 'unidade média': 200 }],
    ['batata-doce assada', 'cereais', 24.0, 0.1, 1.0, 3.0, { 'unidade média': 150 }],
    ['batata baroa (mandioquinha)', 'cereais', 18.9, 0.2, 0.9, 1.7, { 'unidade': 80 }],
    ['mandioca cozida', 'cereais', 30.1, 0.3, 0.6, 1.6, { 'pedaço': 80 }],
    ['inhame cozido', 'cereais', 23.0, 0.1, 1.5, 1.7, { 'pedaço': 80 }],
    ['milho', 'cereais', 21.0, 1.2, 2.6, 3.9, { 'colher de sopa': 25, 'espiga': 100 }],
    ['farinha de mandioca', 'cereais', 87.9, 0.3, 1.6, 6.4, { 'colher de sopa': 15 }],
    ['farofa pronta', 'cereais', 70.0, 10.0, 2.0, 5.0, { 'colher de sopa': 20 }],
    ['quinoa cozida', 'cereais', 21.3, 1.9, 4.4, 2.8, { 'colher de sopa': 25 }],
    ['tortilha', 'cereais', 45.7, 5.2, 9.0, 3.0, { 'unidade': 40 }],
    ['rap10 / wrap integral', 'cereais', 44.0, 6.0, 9.0, 4.0, { 'unidade': 50 }],
    ['biscoito de arroz', 'cereais', 80.0, 3.0, 8.0, 2.0, { 'unidade': 9 }],
    ['torrada integral', 'cereais', 60.0, 8.0, 12.0, 6.0, { 'unidade': 8 }],
    ['waffle / panqueca de aveia', 'cereais', 30.0, 6.0, 12.0, 3.0, { 'unidade': 60 }],
    ['pão de queijo', 'cereais', 34.0, 19.0, 6.0, 1.0, { 'unidade média': 40 }],
    ['pipoca sem óleo', 'cereais', 70.0, 4.0, 12.0, 14.0, { 'xícara estourada': 8 }],
    /* Leguminosas */
    ['feijão', 'leguminosas', 13.8, 1.0, 8.1, 7.0, { 'concha': 100, 'colher de sopa': 25 }],
    ['feijão preto', 'leguminosas', 14.0, 0.5, 4.5, 8.4, { 'concha': 100 }],
    ['lentilha cozida', 'leguminosas', 16.3, 0.5, 6.3, 7.9, { 'concha': 100 }],
    ['grão-de-bico cozido', 'leguminosas', 24.0, 2.1, 8.4, 6.0, { 'colher de sopa': 25 }],
    ['ervilha', 'leguminosas', 14.0, 0.4, 5.0, 5.0, { 'colher de sopa': 20 }],
    ['soja cozida', 'leguminosas', 7.9, 5.5, 14.5, 5.9, { 'colher de sopa': 25 }],
    ['proteína texturizada de soja (crua)', 'leguminosas', 30.0, 1.0, 50.0, 15.0, { 'colher de sopa': 10 }],
    ['tofu', 'leguminosas', 2.1, 5.5, 6.6, 0.8, { 'fatia': 50 }],
    /* Carnes e ovos */
    ['frango', 'proteinas', 0, 1.2, 23.1, 0, { 'filé médio': 120, 'porção': 100 }],
    ['peito de frango grelhado', 'proteinas', 0, 2.5, 32.0, 0, { 'filé médio': 120 }],
    ['coxa de frango sem pele', 'proteinas', 0, 9.0, 26.0, 0, { 'unidade': 80 }],
    ['sobrecoxa de frango sem pele', 'proteinas', 0, 10.0, 24.0, 0, { 'unidade': 100 }],
    ['frango desfiado', 'proteinas', 0, 3.0, 29.0, 0, { 'colher de sopa': 25 }],
    ['patinho moído', 'proteinas', 0, 7.3, 21.0, 0, { 'colher de sopa': 30, 'porção': 100 }],
    ['patinho grelhado', 'proteinas', 0, 7.0, 35.9, 0, { 'bife médio': 120 }],
    ['alcatra grelhada', 'proteinas', 0, 11.0, 32.0, 0, { 'bife médio': 120 }],
    ['coxão mole cozido', 'proteinas', 0, 8.0, 32.0, 0, { 'bife médio': 120 }],
    ['contrafilé grelhado', 'proteinas', 0, 16.0, 31.0, 0, { 'bife médio': 150 }],
    ['filé mignon grelhado', 'proteinas', 0, 8.8, 32.8, 0, { 'medalhão': 100 }],
    ['maminha grelhada', 'proteinas', 0, 12.0, 30.0, 0, { 'fatia': 60 }],
    ['picanha grelhada', 'proteinas', 0, 21.0, 28.0, 0, { 'fatia': 60 }],
    ['carne moída (acém)', 'proteinas', 0, 12.0, 26.0, 0, { 'colher de sopa': 30 }],
    ['fígado bovino grelhado', 'proteinas', 5.0, 5.0, 29.0, 0, { 'bife': 100 }],
    ['mignon suíno', 'proteinas', 0, 3.5, 26.0, 0, { 'medalhão': 100 }],
    ['porco', 'proteinas', 0, 3.5, 26.0, 0, { 'porção': 100 }],
    ['lombo suíno assado', 'proteinas', 0, 6.4, 35.7, 0, { 'fatia': 60 }],
    ['bisteca suína grelhada', 'proteinas', 0, 14.0, 30.0, 0, { 'unidade': 120 }],
    ['peito de peru', 'proteinas', 1.7, 1.4, 19.0, 0, { 'fatia': 15 }],
    ['presunto magro', 'proteinas', 1.5, 3.0, 17.0, 0, { 'fatia': 15 }],
    ['ovo', 'proteinas', 0.9, 15.3, 13.6, 0, { 'unidade': 50 }],
    ['clara de ovo', 'proteinas', 0.7, 0.2, 10.9, 0, { 'unidade': 33 }],
    ['ovo mexido', 'proteinas', 1.0, 15.0, 13.0, 0, { 'ovo': 55 }],
    ['atum', 'proteinas', 0, 1.0, 24.0, 0, { 'lata drenada': 120 }],
    ['atum em óleo drenado', 'proteinas', 0, 8.0, 26.0, 0, { 'lata drenada': 120 }],
    ['sardinha em lata', 'proteinas', 0, 11.0, 24.0, 0, { 'unidade': 40 }],
    ['tilápia grelhada', 'proteinas', 0, 2.7, 26.0, 0, { 'filé': 120 }],
    ['salmão grelhado', 'proteinas', 0, 13.0, 25.0, 0, { 'posta': 150 }],
    ['merluza cozida', 'proteinas', 0, 1.5, 22.0, 0, { 'filé': 120 }],
    ['camarão cozido', 'proteinas', 0, 1.0, 24.0, 0, { 'unidade': 10 }],
    ['bacalhau dessalgado cozido', 'proteinas', 0, 1.0, 29.0, 0, { 'posta': 100 }],
    /* Laticínios */
    ['leite', 'laticinios', 5.0, 3.0, 2.39, 0, { 'copo': 200, 'xícara': 240 }],
    ['leite desnatado', 'laticinios', 4.9, 0.2, 3.3, 0, { 'copo': 200 }],
    ['leite de soja', 'laticinios', 1.1, 2.1, 3.4, 0, { 'copo': 200 }],
    ['leite de amêndoas', 'laticinios', 1.0, 1.1, 0.5, 0, { 'copo': 200 }],
    ['iogurte', 'laticinios', 4.6, 6.3, 4.0, 0, { 'pote': 170, 'copo': 200 }],
    ['iogurte natural desnatado', 'laticinios', 5.0, 0.2, 4.2, 0, { 'pote': 170 }],
    ['iogurte grego', 'laticinios', 7.0, 5.0, 5.5, 0, { 'pote': 100 }],
    ['iogurte proteico (zero)', 'laticinios', 4.0, 0, 10.0, 0, { 'pote': 160 }],
    ['skyr', 'laticinios', 4.0, 0.2, 11.0, 0, { 'pote': 160 }],
    ['queijo', 'laticinios', 0.6, 21.0, 26.0, 0, { 'fatia': 30 }],
    ['queijo minas frescal', 'laticinios', 3.2, 20.2, 17.4, 0, { 'fatia': 30 }],
    ['queijo minas light', 'laticinios', 3.0, 8.0, 18.0, 0, { 'fatia': 30 }],
    ['queijo cottage', 'laticinios', 3.4, 4.3, 11.0, 0, { 'colher de sopa': 30 }],
    ['ricota', 'laticinios', 3.8, 8.1, 12.6, 0, { 'fatia': 30 }],
    ['mussarela', 'laticinios', 2.0, 24.0, 24.0, 0, { 'fatia': 20 }],
    ['queijo prato', 'laticinios', 1.9, 29.0, 22.7, 0, { 'fatia': 20 }],
    ['queijo parmesão ralado', 'laticinios', 1.7, 33.5, 35.6, 0, { 'colher de sopa': 10 }],
    ['requeijão', 'laticinios', 2.0, 23.7, 11.7, 0, { 'colher de sopa': 30 }],
    ['requeijão light', 'laticinios', 4.0, 12.0, 11.0, 0, { 'colher de sopa': 30 }],
    ['cream cheese', 'laticinios', 17.3, 36.7, 24.7, 0, { 'colher de sopa': 30 }],
    ['cream cheese light', 'laticinios', 5.0, 15.0, 8.0, 0, { 'colher de sopa': 30 }],
    ['manteiga', 'gorduras', 0.1, 81.0, 0.9, 0, { 'colher de chá': 5, 'ponta de faca': 5 }],
    /* Frutas */
    ['banana', 'frutas', 22.4, 0.1, 1.2, 1.47, { 'unidade média': 75, 'unidade grande': 100 }],
    ['banana-prata', 'frutas', 26.0, 0.1, 1.3, 2.0, { 'unidade': 70 }],
    ['maçã', 'frutas', 15.2, 0, 0.3, 1.3, { 'unidade média': 130 }],
    ['mamão', 'frutas', 8.9, 0.1, 0.8, 1.8, { 'fatia': 100, 'papaia (metade)': 150 }],
    ['manga', 'frutas', 11.3, 0.6, 0.7, 1.1, { 'unidade média': 300, 'fatia': 60 }],
    ['laranja', 'frutas', 11.5, 0.1, 1.0, 0.8, { 'unidade': 180 }],
    ['tangerina', 'frutas', 9.6, 0.1, 0.7, 0.9, { 'unidade': 130 }],
    ['morango', 'frutas', 6.8, 0.3, 0.9, 1.7, { 'unidade': 12, 'xícara': 150 }],
    ['uva', 'frutas', 13.6, 0.2, 0.7, 0.9, { 'cacho pequeno': 100 }],
    ['melancia', 'frutas', 8.1, 0, 0.9, 0.1, { 'fatia': 200 }],
    ['melão', 'frutas', 7.5, 0, 0.7, 0.3, { 'fatia': 150 }],
    ['abacaxi', 'frutas', 12.3, 0.1, 0.9, 1.0, { 'fatia': 80 }],
    ['abacate', 'frutas', 6.0, 8.4, 1.2, 6.3, { 'colher de sopa': 30, 'metade': 200 }],
    ['kiwi', 'frutas', 11.5, 0.6, 1.3, 2.7, { 'unidade': 75 }],
    ['pera', 'frutas', 14.0, 0.1, 0.6, 3.0, { 'unidade': 130 }],
    ['goiaba', 'frutas', 13.0, 0.4, 1.1, 6.2, { 'unidade': 170 }],
    ['maracujá (polpa)', 'frutas', 12.3, 2.1, 2.0, 1.1, { 'unidade': 60 }],
    ['açaí (polpa sem açúcar)', 'frutas', 6.2, 3.9, 0.8, 2.6, { 'polpa': 100 }],
    ['açaí (tigela com xarope)', 'frutas', 23.0, 4.0, 1.0, 2.0, { 'tigela 300 ml': 300 }],
    ['ameixa seca', 'frutas', 63.9, 0.4, 2.2, 7.1, { 'unidade': 8 }],
    ['uva-passa', 'frutas', 79.2, 0.5, 3.1, 3.7, { 'colher de sopa': 15 }],
    ['tâmara', 'frutas', 75.0, 0.2, 1.8, 8.0, { 'unidade': 8 }],
    ['coco fresco', 'frutas', 10.4, 42.0, 3.7, 5.4, { 'pedaço': 30 }],
    ['frutas vermelhas congeladas', 'frutas', 10.0, 0.3, 0.9, 3.0, { 'xícara': 140 }],
    /* Vegetais e legumes */
    ['seleta de legumes', 'vegetais', 7.734, 0.26, 2.436, 1.0, { 'colher de sopa': 25 }],
    ['brócolis', 'vegetais', 6.6, 0.3, 2.8, 2.6, { 'colher de sopa': 20, 'ramo': 30 }],
    ['couve-flor', 'vegetais', 4.5, 0.3, 1.9, 2.1, { 'ramo': 30 }],
    ['cenoura', 'vegetais', 3.6, 0, 0.7, 3.0, { 'colher de sopa': 20, 'unidade': 70 }],
    ['abóbora', 'vegetais', 6.5, 0.1, 1.0, 0.5, { 'colher de sopa': 30 }],
    ['abobrinha', 'vegetais', 3.0, 0.2, 1.1, 1.6, { 'fatia': 15 }],
    ['chuchu', 'vegetais', 4.1, 0.1, 0.4, 1.0, { 'colher de sopa': 30 }],
    ['vagem', 'vegetais', 7.55, 0.2, 2.8, 2.4, { 'colher de sopa': 25 }],
    ['tomate', 'vegetais', 3.92, 0.2, 0.88, 1.3, { 'unidade': 90, 'fatia': 15 }],
    ['alface', 'vegetais', 1.7, 0.2, 1.3, 1.7, { 'folha': 10, 'prato': 40 }],
    ['couve refogada', 'vegetais', 8.7, 6.6, 3.0, 5.7, { 'colher de sopa': 20 }],
    ['espinafre refogado', 'vegetais', 2.6, 1.0, 2.9, 2.0, { 'colher de sopa': 25 }],
    ['pepino', 'vegetais', 2.0, 0, 0.9, 1.1, { 'fatia': 10 }],
    ['repolho', 'vegetais', 3.9, 0.1, 0.9, 1.9, { 'colher de sopa': 15 }],
    ['beterraba cozida', 'vegetais', 7.2, 0.1, 1.3, 1.9, { 'fatia': 20 }],
    ['berinjela', 'vegetais', 4.4, 0.1, 1.2, 2.9, { 'fatia': 30 }],
    ['pimentão', 'vegetais', 4.9, 0.2, 1.1, 2.6, { 'unidade': 100 }],
    ['cebola', 'vegetais', 8.9, 0.1, 1.7, 2.2, { 'colher de sopa': 15 }],
    ['cogumelos', 'vegetais', 3.3, 0.3, 3.1, 1.5, { 'xícara': 70 }],
    ['palmito', 'vegetais', 4.0, 0.4, 1.8, 2.0, { 'unidade': 40 }],
    ['mix de folhas', 'vegetais', 2.5, 0.2, 1.5, 2.0, { 'prato': 50 }],
    /* Gorduras e oleaginosas */
    ['azeite de oliva', 'gorduras', 0, 100.0, 0, 0, { 'colher de sopa': 13, 'colher de chá': 4, 'fio': 5 }],
    ['óleo de coco', 'gorduras', 0, 100.0, 0, 0, { 'colher de sopa': 13 }],
    ['pasta de amendoim', 'gorduras', 20.0, 50.0, 25.0, 6.0, { 'colher de sopa': 20 }],
    ['pasta de amendoim integral (sem açúcar)', 'gorduras', 12.0, 50.0, 28.0, 8.0, { 'colher de sopa': 20 }],
    ['amendoim torrado', 'gorduras', 18.7, 43.9, 27.2, 8.0, { 'colher de sopa': 15 }],
    ['castanha-do-pará', 'gorduras', 15.1, 63.5, 14.5, 7.9, { 'unidade': 4 }],
    ['castanha de caju', 'gorduras', 29.1, 46.3, 18.5, 3.7, { 'unidade': 2, 'punhado': 30 }],
    ['amêndoas', 'gorduras', 21.6, 49.9, 21.2, 12.5, { 'unidade': 1.2, 'punhado': 30 }],
    ['nozes', 'gorduras', 13.7, 65.2, 15.2, 6.7, { 'unidade': 5 }],
    ['chia', 'gorduras', 2.4, 27.7, 23.9, 34.0, { 'colher de sopa': 12 }],
    ['linhaça', 'gorduras', 4.0, 32.3, 14.1, 33.5, { 'colher de sopa': 10 }],
    ['semente de abóbora', 'gorduras', 14.0, 49.0, 30.0, 6.0, { 'colher de sopa': 12 }],
    ['gema de ovo', 'gorduras', 1.6, 26.5, 15.9, 0, { 'unidade': 17 }],
    /* Doces, molhos e bebidas */
    ['mel', 'doces', 82.4, 0, 0.3, 0, { 'colher de sopa': 25, 'colher de chá': 8 }],
    ['geleia', 'doces', 40.0, 0, 0, 0, { 'colher de sopa': 20 }],
    ['geleia zero', 'doces', 8.0, 0, 0.3, 1.0, { 'colher de sopa': 20 }],
    ['chocolate 70%', 'doces', 36.8, 40.0, 7.6, 11.6, { 'quadradinho': 5, 'barra 25 g': 25 }],
    ['chocolate ao leite', 'doces', 59.0, 30.0, 7.0, 2.0, { 'quadradinho': 6 }],
    ['cacau em pó', 'doces', 20.0, 12.0, 20.0, 30.0, { 'colher de sopa': 10 }],
    ['doce de leite', 'doces', 55.0, 6.0, 6.0, 0, { 'colher de sopa': 20 }],
    ['leite condensado', 'doces', 57.0, 8.0, 7.6, 0, { 'colher de sopa': 20 }],
    ['açúcar', 'doces', 99.5, 0, 0, 0, { 'colher de sopa': 15, 'colher de chá': 5 }],
    ['paçoca', 'doces', 55.0, 23.0, 14.0, 4.0, { 'unidade': 18 }],
    ['barra de proteína', 'doces', 40.0, 8.0, 30.0, 8.0, { 'unidade': 45 }],
    ['barra de cereal', 'doces', 70.0, 8.0, 5.0, 4.0, { 'unidade': 22 }],
    ['sorvete', 'doces', 25.0, 10.0, 3.5, 0, { 'bola': 60 }],
    ['ketchup', 'molhos', 25.0, 0.2, 1.5, 0, { 'colher de sopa': 15 }],
    ['mostarda', 'molhos', 1.2, 4.4, 4.3, 0, { 'colher de sopa': 15 }],
    ['maionese', 'molhos', 2.0, 75.0, 0.5, 0, { 'colher de sopa': 15 }],
    ['maionese light', 'molhos', 6.0, 30.0, 0.8, 0, { 'colher de sopa': 15 }],
    ['molho de tomate', 'molhos', 6.0, 1.0, 1.5, 1.5, { 'colher de sopa': 20 }],
    ['shoyu', 'molhos', 6.0, 0, 6.0, 0, { 'colher de sopa': 15 }],
    ['matcha', 'bebidas', 69.0, 15.0, 2.7, 0, { 'colher de chá': 2 }],
    ['café sem açúcar', 'bebidas', 0.4, 0, 0.1, 0, { 'xícara': 50, 'copo': 200 }],
    ['suco de laranja natural', 'bebidas', 9.0, 0.1, 0.7, 0.1, { 'copo': 200 }],
    ['água de coco', 'bebidas', 5.3, 0, 0, 0.1, { 'copo': 200 }],
    ['refrigerante', 'bebidas', 10.5, 0, 0, 0, { 'lata': 350 }],
    ['refrigerante zero', 'bebidas', 0, 0, 0, 0, { 'lata': 350 }],
    ['cerveja', 'bebidas', 3.6, 0, 0.5, 0, { 'lata': 350, 'long neck': 330 }],
    ['vinho tinto', 'bebidas', 2.6, 0, 0.1, 0, { 'taça': 150 }],
    /* Suplementos alimentares */
    ['whey', 'suplementos', 13.33, 5.33, 76.67, 0, { 'dose (scoop)': 30 }],
    ['whey isolado', 'suplementos', 3.0, 1.0, 90.0, 0, { 'dose (scoop)': 30 }],
    ['caseína', 'suplementos', 7.0, 2.0, 80.0, 0, { 'dose (scoop)': 30 }],
    ['albumina', 'suplementos', 4.0, 0.5, 80.0, 0, { 'dose': 30 }],
    ['proteína vegetal (ervilha/arroz)', 'suplementos', 8.0, 5.0, 75.0, 3.0, { 'dose': 30 }],
    ['hipercalórico', 'suplementos', 83.33, 0.93, 13.33, 0, { 'dose': 150 }],
    ['waxy maze', 'suplementos', 86.0, 0, 0, 0, { 'dose': 30 }],
    ['maltodextrina', 'suplementos', 95.0, 0, 0, 0, { 'dose': 30 }],
    ['dextrose', 'suplementos', 95.0, 0, 0, 0, { 'dose': 30 }],
    ['palatinose', 'suplementos', 98.0, 0, 0, 0, { 'dose': 25 }],
    ['glicerol', 'suplementos', 100.0, 0, 0, 0, { 'dose': 15 }],
    ['creatina', 'suplementos', 0, 0, 0, 0, { 'dose': 5 }],
    ['colágeno hidrolisado', 'suplementos', 0, 0, 90.0, 0, { 'dose': 10 }],
    ['gel de carboidrato', 'suplementos', 70.0, 0, 0, 0, { 'sachê': 30 }],
    /* Pratos e preparações brasileiras */
    ['omelete (2 ovos com queijo)', 'preparos', 2.0, 16.0, 16.0, 0, { 'unidade': 150 }],
    ['crepioca (1 ovo + 2 col. goma)', 'preparos', 22.0, 6.0, 7.0, 0.5, { 'unidade': 110 }],
    ['panqueca de banana e aveia', 'preparos', 28.0, 6.0, 9.0, 3.0, { 'unidade': 90 }],
    ['vitamina de banana com whey', 'preparos', 12.0, 1.5, 8.0, 0.8, { 'copo': 300 }],
    ['strogonoff de frango', 'preparos', 4.0, 8.0, 14.0, 0.3, { 'concha': 120 }],
    ['escondidinho de carne', 'preparos', 15.0, 6.0, 9.0, 1.0, { 'porção': 200 }],
    ['sopa de legumes com frango', 'preparos', 6.0, 1.5, 6.0, 1.5, { 'prato': 300 }],
    ['salada de frutas', 'preparos', 14.0, 0.2, 0.8, 1.5, { 'pote': 200 }],
    ['sanduíche natural de frango', 'preparos', 22.0, 6.0, 14.0, 2.5, { 'unidade': 180 }],
    ['pizza (fatia média)', 'preparos', 33.0, 10.0, 12.0, 2.0, { 'fatia': 100 }],
    ['hambúrguer artesanal', 'preparos', 22.0, 15.0, 15.0, 1.2, { 'unidade': 250 }],
    ['coxinha', 'preparos', 30.0, 15.0, 9.0, 1.0, { 'unidade': 80 }],
    ['pastel de carne', 'preparos', 34.0, 19.0, 9.0, 1.2, { 'unidade': 90 }],
    ['sushi (uramaki)', 'preparos', 28.0, 4.0, 6.0, 0.8, { 'peça': 25 }],
    ['feijoada', 'preparos', 12.0, 8.0, 10.0, 6.0, { 'concha': 140 }],
    ['moqueca de peixe', 'preparos', 3.0, 8.0, 14.0, 0.5, { 'concha': 150 }]
  ];

  const categoriasAlimento = {
    cereais: 'Cereais, pães e tubérculos', leguminosas: 'Leguminosas', proteinas: 'Carnes, ovos e peixes', laticinios: 'Laticínios',
    frutas: 'Frutas', vegetais: 'Vegetais e legumes', gorduras: 'Gorduras e oleaginosas', doces: 'Doces e snacks', molhos: 'Molhos e condimentos',
    bebidas: 'Bebidas', suplementos: 'Suplementos', preparos: 'Pratos e preparações', custom: 'Meus alimentos'
  };

  const alimentos = AL.map((a) => {
    const c = a[2], g = a[3], p = a[4];
    return { id: slug(a[0]), nome: a[0], categoria: a[1], c, g, p, fib: a[5] || 0, kcal: Math.round((c * 4 + g * 9 + p * 4) * 10) / 10, medidas: a[6] || {}, liquido: a[1] === 'bebidas' || /leite|suco|água|vitamina/.test(a[0]) };
  });

  /* Papel de cada alimento no gerador de dieta */
  const papelAlimento = {
    carbo: ['arroz', 'arroz-integral', 'batata-doce-cozida', 'batata', 'macarrao-cozido', 'mandioca-cozida', 'pao-frances', 'pao-integral', 'tapioca-goma-hidratada', 'aveia', 'cuscuz-de-milho', 'inhame-cozido'],
    proteina: ['frango', 'peito-de-frango-grelhado', 'patinho-grelhado', 'mignon-suino', 'tilapia-grelhada', 'ovo', 'clara-de-ovo', 'whey', 'atum', 'carne-moida-acem', 'iogurte-natural-desnatado', 'queijo-cottage'],
    gordura: ['azeite-de-oliva', 'pasta-de-amendoim-integral-sem-acucar', 'castanha-do-para', 'amendoas', 'abacate', 'chocolate-70', 'gema-de-ovo'],
    fruta: ['banana', 'mamao', 'maca', 'manga', 'morango', 'laranja', 'melancia', 'uva'],
    vegetal: ['seleta-de-legumes', 'brocolis', 'mix-de-folhas', 'cenoura', 'abobrinha', 'tomate', 'vagem'],
    laticinio: ['iogurte', 'iogurte-natural-desnatado', 'leite', 'leite-desnatado', 'queijo-minas-frescal', 'requeijao-light', 'iogurte-proteico-zero']
  };

  /* Modelos de refeição usados pelo gerador de dieta */
  const modelosRefeicao = {
    cafe: { nome: 'Café da manhã', hora: '07:30', itens: [['ovo', 100], ['pao-frances', 50], ['requeijao-light', 30], ['banana', 75], ['cafe-sem-acucar', 200]], flex: { proteina: 'ovo', carbo: 'pao-frances', fruta: 'banana' } },
    'cafe-doce': { nome: 'Café da manhã', hora: '07:30', itens: [['iogurte-natural-desnatado', 170], ['aveia', 40], ['banana', 100], ['mamao', 150], ['mel', 10], ['whey', 20]], flex: { proteina: 'whey', carbo: 'aveia', fruta: 'banana' } },
    'lanche-manha': { nome: 'Lanche da manhã', hora: '10:00', itens: [['maca', 130], ['castanha-do-para', 12]], flex: { fruta: 'maca', gordura: 'castanha-do-para' } },
    almoco: { nome: 'Almoço', hora: '12:30', itens: [['arroz', 150], ['feijao', 100], ['frango', 150], ['seleta-de-legumes', 100], ['mix-de-folhas', 50], ['azeite-de-oliva', 5]], flex: { carbo: 'arroz', proteina: 'frango', gordura: 'azeite-de-oliva' } },
    'pre-treino': { nome: 'Pré-treino', hora: '16:00', itens: [['pao-frances', 50], ['peito-de-peru', 30], ['banana', 75]], flex: { carbo: 'pao-frances', proteina: 'peito-de-peru' } },
    'pos-treino': { nome: 'Pós-treino', hora: '18:00', itens: [['whey', 30], ['banana', 100], ['aveia', 30]], flex: { proteina: 'whey', carbo: 'aveia', fruta: 'banana' } },
    lanche: { nome: 'Lanche da tarde', hora: '16:30', itens: [['iogurte', 170], ['granola-tradicional', 30], ['morango', 100]], flex: { carbo: 'granola-tradicional', fruta: 'morango' } },
    jantar: { nome: 'Jantar', hora: '20:00', itens: [['batata-doce-cozida', 200], ['patinho-grelhado', 150], ['brocolis', 100], ['azeite-de-oliva', 5]], flex: { carbo: 'batata-doce-cozida', proteina: 'patinho-grelhado', gordura: 'azeite-de-oliva' } },
    'jantar-arroz': { nome: 'Jantar', hora: '20:00', itens: [['arroz', 100], ['feijao', 100], ['mignon-suino', 120], ['seleta-de-legumes', 150], ['chocolate-70', 15]], flex: { carbo: 'arroz', proteina: 'mignon-suino', gordura: 'chocolate-70' } },
    ceia: { nome: 'Ceia', hora: '22:00', itens: [['iogurte-proteico-zero', 160], ['pasta-de-amendoim-integral-sem-acucar', 15]], flex: { proteina: 'iogurte-proteico-zero', gordura: 'pasta-de-amendoim-integral-sem-acucar' } },
    suplementacao: { nome: 'Suplementação (intra/peri-treino)', hora: 'Treino', itens: [['whey', 20], ['waxy-maze', 15], ['creatina', 5]], flex: {} }
  };

  const estruturasDieta = {
    3: ['cafe', 'almoco', 'jantar'],
    4: ['cafe', 'almoco', 'lanche', 'jantar'],
    5: ['cafe', 'almoco', 'pre-treino', 'pos-treino', 'jantar-arroz'],
    6: ['cafe-doce', 'lanche-manha', 'almoco', 'pre-treino', 'pos-treino', 'jantar'],
    7: ['cafe-doce', 'lanche-manha', 'almoco', 'pre-treino', 'pos-treino', 'jantar', 'ceia']
  };

  /* ---------- Suplementos (catálogo) ---------- */
  const suplementos = [
    { id: 'whey', nome: 'Whey protein', dose: '30 g', momento: 'Pós-treino ou em refeições com pouca proteína', desc: 'Proteína de rápida absorção para atingir a meta diária.' },
    { id: 'creatina', nome: 'Creatina monoidratada', dose: '3–5 g/dia', momento: 'Qualquer horário, todos os dias', desc: 'Força, potência e volume celular. Não precisa de saturação nem ciclo.' },
    { id: 'cafeina', nome: 'Cafeína', dose: '3–6 mg/kg (200–400 mg)', momento: '30–60 min antes do treino', desc: 'Desempenho e foco. Evite após as 16h se dormir mal.' },
    { id: 'beta-alanina', nome: 'Beta-alanina', dose: '3,2–6,4 g/dia (dividida)', momento: 'Diária, fracionada', desc: 'Tamponamento de H+; ajuda em séries de 1–4 min. Formigamento é normal.' },
    { id: 'citrulina', nome: 'Citrulina malato', dose: '6–8 g', momento: '30–60 min antes do treino', desc: 'Pump e resistência muscular.' },
    { id: 'glicerol', nome: 'Glicerol', dose: '1–1,5 g/kg com 500 ml de água', momento: '60–90 min antes do treino', desc: 'Hiper-hidratação e volume; usado como pré-treino de pump.' },
    { id: 'waxy-maize', nome: 'Waxy maize / maltodextrina', dose: '15–40 g', momento: 'Intra ou pós-treino', desc: 'Carboidrato rápido para reposição de glicogênio.' },
    { id: 'hipercalorico', nome: 'Hipercalórico', dose: '100–150 g', momento: 'Refeição extra ou pós-treino', desc: 'Para quem não alcança as calorias do bulking.' },
    { id: 'omega-3', nome: 'Ômega-3 (EPA/DHA)', dose: '1–3 g/dia', momento: 'Com refeições', desc: 'Anti-inflamatório, saúde cardiovascular.' },
    { id: 'vitamina-d', nome: 'Vitamina D3', dose: '1.000–2.000 UI/dia', momento: 'Com refeição gordurosa', desc: 'Conforme exame; imunidade e saúde óssea.' },
    { id: 'multivitaminico', nome: 'Multivitamínico', dose: '1 dose/dia', momento: 'Café da manhã', desc: 'Seguro em cutting com dieta restrita.' },
    { id: 'zma', nome: 'ZMA (zinco + magnésio)', dose: '1 dose', momento: 'Antes de dormir', desc: 'Qualidade do sono e recuperação.' },
    { id: 'pre-treino', nome: 'Pré-treino pronto', dose: '1 dose', momento: '30 min antes do treino', desc: 'Geralmente cafeína + beta-alanina + citrulina.' },
    { id: 'caseina', nome: 'Caseína', dose: '30–40 g', momento: 'Antes de dormir', desc: 'Proteína de absorção lenta.' },
    { id: 'albumina', nome: 'Albumina', dose: '30 g', momento: 'Qualquer refeição', desc: 'Alternativa econômica ao whey.' },
    { id: 'glutamina', nome: 'Glutamina', dose: '5–10 g', momento: 'Pós-treino ou antes de dormir', desc: 'Suporte intestinal e imunológico em fases de alto volume.' },
    { id: 'colageno', nome: 'Colágeno hidrolisado', dose: '10–15 g', momento: '30–60 min antes do treino com vitamina C', desc: 'Saúde de tendões e articulações.' },
    { id: 'termogenico', nome: 'Termogênico', dose: '1 dose', momento: 'Manhã ou pré-treino', desc: 'Cafeína e outros estimulantes; use com cautela.' },
    { id: 'bcaa', nome: 'BCAA', dose: '5–10 g', momento: 'Intra-treino', desc: 'Dispensável quando a proteína diária está adequada.' },
    { id: 'eletrolitos', nome: 'Eletrólitos / isotônico', dose: '1 dose em 500 ml', momento: 'Treinos longos ou calor', desc: 'Sódio, potássio e magnésio.' },
    { id: 'melatonina', nome: 'Melatonina', dose: '0,5–3 mg', momento: '30 min antes de dormir', desc: 'Ajuda a regular o sono.' },
    { id: 'ashwagandha', nome: 'Ashwagandha', dose: '300–600 mg', momento: 'Noite', desc: 'Redução de estresse; evidência moderada.' }
  ];

  /* ---------- Atividades aeróbicas (MET) ---------- */
  const aerobicos = [
    { id: 'caminhada', nome: 'Caminhada', met: { leve: 3.0, moderado: 4.0, intenso: 5.0 }, distancia: true },
    { id: 'caminhada-inclinada', nome: 'Caminhada inclinada (esteira)', met: { leve: 4.5, moderado: 6.0, intenso: 8.0 }, distancia: true },
    { id: 'corrida', nome: 'Corrida', met: { leve: 7.0, moderado: 9.8, intenso: 12.5 }, distancia: true },
    { id: 'bike', nome: 'Bicicleta ergométrica', met: { leve: 4.0, moderado: 6.8, intenso: 10.0 }, distancia: false },
    { id: 'ciclismo', nome: 'Ciclismo (rua)', met: { leve: 5.8, moderado: 8.0, intenso: 12.0 }, distancia: true },
    { id: 'eliptico', nome: 'Elíptico', met: { leve: 4.5, moderado: 6.0, intenso: 8.5 }, distancia: false },
    { id: 'escada', nome: 'Escada / stair climber', met: { leve: 6.0, moderado: 8.0, intenso: 10.0 }, distancia: false },
    { id: 'remo', nome: 'Remo ergômetro', met: { leve: 4.8, moderado: 7.0, intenso: 10.0 }, distancia: true },
    { id: 'natacao', nome: 'Natação', met: { leve: 5.0, moderado: 7.0, intenso: 10.0 }, distancia: true },
    { id: 'corda', nome: 'Pular corda', met: { leve: 8.0, moderado: 10.0, intenso: 12.0 }, distancia: false },
    { id: 'hiit', nome: 'HIIT', met: { leve: 8.0, moderado: 10.0, intenso: 13.0 }, distancia: false },
    { id: 'futebol', nome: 'Futebol', met: { leve: 6.0, moderado: 8.0, intenso: 10.0 }, distancia: false },
    { id: 'luta', nome: 'Luta / jiu-jitsu / muay thai', met: { leve: 6.0, moderado: 9.0, intenso: 12.0 }, distancia: false },
    { id: 'funcional', nome: 'Funcional / crossfit', met: { leve: 6.0, moderado: 8.0, intenso: 11.0 }, distancia: false },
    { id: 'danca', nome: 'Dança / zumba', met: { leve: 4.5, moderado: 6.5, intenso: 8.0 }, distancia: false },
    { id: 'volei', nome: 'Vôlei / beach tennis', met: { leve: 4.0, moderado: 6.0, intenso: 8.0 }, distancia: false },
    { id: 'trilha', nome: 'Trilha / hiking', met: { leve: 5.0, moderado: 6.5, intenso: 8.0 }, distancia: true },
    { id: 'yoga', nome: 'Yoga / pilates', met: { leve: 2.5, moderado: 3.5, intenso: 4.5 }, distancia: false }
  ];

  const zonasFC = [
    { z: 1, nome: 'Recuperação', pct: [50, 60] }, { z: 2, nome: 'Base aeróbica', pct: [60, 70] },
    { z: 3, nome: 'Tempo', pct: [70, 80] }, { z: 4, nome: 'Limiar', pct: [80, 90] }, { z: 5, nome: 'VO2 máx', pct: [90, 100] }
  ];

  return {
    slug, grupos, grupoMap, aparelhos, padroes, exercicios, exercicioAlias, metodos, divisoes, fases, modelosMacro, progressaoMicro,
    fatoresAtividade, objetivos, presetsMacro, alimentos, categoriasAlimento, papelAlimento, modelosRefeicao, estruturasDieta,
    suplementos, aerobicos, zonasFC
  };
})();
