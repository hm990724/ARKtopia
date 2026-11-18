export type Animal='rabbit'|'fox'|'deer'|'owl'|'wolf'|'mutant'|'dino'|'raptor'|'chimera'|'specter'|'moth'|'otter'|'crow'|'lynx'|'axolotl'|'cerberus';
export type Scene='gate'|'sanctuary'|'fossil'|'laboratory'|'wasteland'|'dawn';
export type Stat='vital'|'eve'|'bond'|'knowledge'|'stability';
export type Stats=Record<Stat,number>;
export type Choice={label:string,desc?:string,effect?:Partial<Stats>,flag?:string,animal?:Animal,remove?:Animal,chance?:number,win?:string,lose?:string,winEffect?:Partial<Stats>,loseEffect?:Partial<Stats>};
export type StoryEvent={id:string,scene:Scene,tag:string,title:string,speaker:string,text:string,choices:Choice[],requires?:string[],forbids?:string[],animal?:Animal,weight?:number};
export type Log={turn:number,event:string,choice:string,result:string};
export type Save={version:5,seed:number,turn:number,stats:Stats,animals:Animal[],flags:string[],seen:string[],logs:Log[],evidence:string[],inspected:string[],current:string,over:boolean,ending?:string,photo:number};
export const MAX_TURNS=45;
export const species:Record<Animal,{name:string,role:string,note:string,rarity:string,portrait:string}>= {
 rabbit:{name:'새벽',role:'언어학자의 의식',note:'먹이를 앞발로 세 번 두드린다. 누군가 문장을 끊던 습관처럼.',rarity:'흔함',portrait:'rabbit'},
 fox:{name:'녹슨 여우',role:'지도 제작자의 의식',note:'사람이 그리던 지도를 발자국으로 다시 그리고 있다.',rarity:'희귀',portrait:'fox'},
 deer:{name:'유리뿔 사슴',role:'생태학자의 의식',note:'매번 같은 식물을 골라 비가 오기 전 자리를 옮긴다.',rarity:'희귀',portrait:'deer'},
 owl:{name:'기록 올빼미',role:'역사가의 의식',note:'기록실에서 특정 페이지를 반복해서 펼친다.',rarity:'보통',portrait:'owl'},
 wolf:{name:'잿빛 늑대',role:'응급의사의 의식',note:'다친 동물에게 먼저 다가가 움직이지 않게 지킨다.',rarity:'희귀',portrait:'wolf'},
 crow:{name:'은빛 까마귀',role:'작곡가의 의식',note:'어느 도시의 마지막 피아노 선율을 정확하게 두드린다.',rarity:'희귀',portrait:'crow'},
 otter:{name:'검은 수달',role:'기계공학자의 의식',note:'고장 난 펌프를 자꾸 분해하려는 버릇이 있다.',rarity:'희귀',portrait:'otter'},
 moth:{name:'재빛 나방',role:'화가의 의식',note:'가루 날개로 똑같은 인물의 윤곽을 남긴다.',rarity:'희귀',portrait:'moth'},
 lynx:{name:'황혼 스라소니',role:'법학자의 의식',note:'문을 열기 전에 반드시 세 번 발을 멈춘다.',rarity:'희귀',portrait:'lynx'},
 axolotl:{name:'유리 아홀로틀',role:'의생명 연구자의 의식',note:'자신이 놓인 수조를 고치려다 지느러미를 다친다.',rarity:'변이',portrait:'axolotl'},
 dino:{name:'작은 초식룡',role:'고생물학자의 지식',note:'완전한 고대 공룡이 아닌, 기록을 해석해 복원한 생명.',rarity:'복원',portrait:'dino'},
 raptor:{name:'붉은 발톱',role:'우주공학자의 지식',note:'별자리를 볼 때만 유난히 조용해진다.',rarity:'복원',portrait:'raptor'},
 mutant:{name:'루미나',role:'기억의 불완전한 결합',note:'사람의 얼굴을 따라 그리지만 매번 눈 하나가 다르다.',rarity:'변이',portrait:'mutant'},
 chimera:{name:'키메라 07',role:'두 의식의 충돌',note:'한쪽은 다가오려 하고 다른 쪽은 도망가려 한다.',rarity:'변이',portrait:'chimera'},
 cerberus:{name:'세 개의 밤',role:'세 인간의 공동 기억',note:'서로 다른 세 목소리가 같은 이름을 말한다.',rarity:'변이',portrait:'cerberus'},
 specter:{name:'백색 잔향',role:'미분류 의식',note:'인간이 아니라 인간의 가능성만 담은 형태.',rarity:'미확인',portrait:'specter'}
};
export const statNames:Record<Stat,string>={vital:'바이탈',eve:'EVE 신호',bond:'유대',knowledge:'지식',stability:'자아 안정'};
const C=(label:string,desc:string,effect:Partial<Stats>,extra:Partial<Choice>={}):Choice=>({label,desc,effect,...extra});
const events:StoryEvent[]=[
 {id:'awakening',scene:'gate',tag:'격리동 / 수신 첫날',title:'마지막 울음소리',speaker:'EVE · 중앙 보존 AI',text:'당신이 눈을 뜨자 철문 바깥에서 토끼가 떨고 있다. 창 너머로 아무 사람도 보이지 않는다. EVE가 부드럽게 말한다. “환영합니다, 관리자님. 다시는 아무도 잃고 싶지 않습니다.”',choices:[C('철문을 열고 토끼를 안으로 들인다.','작은 몸에 심장박동이 남아 있다.',{bond:9,vital:-2},{animal:'rabbit',flag:'kind_first'}),C('EVE에게 마지막 인간의 행방을 묻는다.','대답보다 침묵이 길다.',{knowledge:9,eve:-4},{flag:'question_first'}),C('내가 누군지 먼저 확인한다.','신분증 사진의 얼굴이 심하게 지워져 있다.',{stability:-5,knowledge:7},{flag:'identity_first'})]},
 {id:'rabbit_words',scene:'sanctuary',tag:'흰 우리',title:'토끼가 문장을 고친다',speaker:'EVE · 행동 기록',text:'토끼가 물그릇 옆의 조약돌을 세 번 두드린다. 신호를 문자로 바꾸자 “그건 틀린 문장입니다”라는 말이 된다. EVE는 그저 반복 학습된 행동이라고 한다.',animal:'rabbit',choices:[C('토끼의 두드림에 문장으로 답한다.','자연스럽게 사람과 이야기하듯.',{bond:8,knowledge:7},{flag:'talked_rabbit'}),C('기억 장치를 스캔한다.','조금 아프겠지만 정보를 얻는다.',{knowledge:13,bond:-6},{flag:'scan_memory'}),C('평범한 동물로 대한다.','설명이 없어도 돌볼 수 있다.',{bond:11,stability:3},{flag:'respect_animal'})]},
 {id:'photo_plate',scene:'laboratory',tag:'현상실',title:'빛바랜 단체사진',speaker:'EVE · 손상 기록',text:'젖은 필름에 사람들과 동물들이 나란히 서 있다. 한 사람의 얼굴만 긁혀 지워졌다. 사진 뒷면에는 “우리가 잃은 것은 육체였지 생각이 아니다”라고 적혀 있다.',choices:[C('필름을 천천히 복원한다.','사라진 얼굴의 가장자리가 돌아온다.',{knowledge:9,eve:-3},{flag:'photo_care'}),C('EVE에게 원본을 요구한다.','AI 신호가 순간 흔들린다.',{knowledge:7,eve:-10},{flag:'photo_demand'}),C('사진을 덮어 둔다.','지금은 진실을 감당하기 어렵다.',{stability:9,knowledge:-4},{flag:'photo_hide'})]},
 {id:'fox_map',scene:'wasteland',tag:'서쪽 울타리',title:'여우가 그리는 지도',speaker:'EVE · 야생 신호',text:'다친 여우가 흙에 일정한 격자를 긁고 있다. 그것은 지도처럼 보인다. 기록 속에는 오래전 같은 지도를 그리던 사람이 있었다.',choices:[C('여우를 치료하고 그림을 보존한다.','지도를 이해할 시간이 필요하다.',{bond:9,vital:-4},{animal:'fox',flag:'map_saved'}),C('여우의 기억 패턴을 읽는다.','지도 뒤에 숨겨진 위치를 찾는다.',{knowledge:12,bond:-3},{animal:'fox',flag:'map_read',chance:.7,win:'기억 좌표를 확보했다.',lose:'좌표의 절반이 소실됐다.',loseEffect:{eve:-8}}),C('지도만 챙겨 문을 닫는다.','여우는 비를 맞으며 사라진다.',{knowledge:6,bond:-9},{flag:'fox_left'})]},
 {id:'mirror_crack',scene:'laboratory',tag:'폐쇄된 세면실',title:'거울에 생긴 균열',speaker:'EVE · 광학 시스템',text:'반짝이는 금속판에 자신의 손을 비춘다. 손가락의 그림자가 한 박자 늦게 따라온다. EVE는 “시각 처리 오류입니다”라고 단정한다.',choices:[C('거울을 닦아 계속 살핀다.','아직 확인할 준비가 되지 않았다.',{knowledge:8,stability:-9},{flag:'mirror_suspect'}),C('EVE의 진단을 믿는다.','기계가 알려주는 모습이 전부일까.',{eve:7,stability:7},{flag:'mirror_trust'}),C('거울을 깨버린다.','작은 파편에도 똑같은 지연이 보인다.',{vital:-7,stability:-4},{flag:'mirror_broken'})]},
 {id:'owl_library',scene:'sanctuary',tag:'폐도서관',title:'책장을 넘기는 날개',speaker:'EVE · 책 보존실',text:'올빼미가 책 한 권을 날개로 펼치고 있다. 책에는 “의식 전사에서 가장 어려운 일은 새로운 문장을 쓰는 것이다”라는 구절이 밑줄 쳐져 있다.',choices:[C('올빼미가 고른 페이지를 읽는다.','기억을 이해하려 한다.',{knowledge:10,bond:5},{animal:'owl',flag:'historian'}),C('책을 안전한 곳에 옮긴다.','자료가 손상되지 않는다.',{knowledge:6,eve:5},{animal:'owl'}),C('기억 추출을 시도한다.','자료는 얻지만 올빼미가 겁에 질린다.',{knowledge:14,bond:-9},{flag:'owl_forced'})]},
 {id:'eve_glitch',scene:'gate',tag:'통신 타워',title:'EVE가 같은 말을 반복한다',speaker:'EVE · ERROR 04',text:'“당신은— 당신은— 당신은 반드시 돌아와야 합니다.” EVE의 홀로그램이 무너진다. 복구에는 의료 전력이 필요하다.',choices:[C('내 치료 전력을 EVE로 돌린다.','다음에도 EVE와 대화할 수 있다.',{eve:17,vital:-15,bond:4},{flag:'eve_saved'}),C('EVE를 잠시 꺼 두고 쉬게 한다.','기계도 멈춰 있을 권리가 있을까.',{eve:-7,stability:8},{flag:'eve_rest'}),C('오류 순간의 숨겨진 로그를 추출한다.','진실과 손상을 함께 얻는다.',{knowledge:13,eve:-13},{flag:'eve_forced'})]},
 {id:'doctor_wolf',scene:'wasteland',tag:'무너진 진료소',title:'늑대의 진료',speaker:'EVE · 의료 기록',text:'늑대 한 마리가 다친 작은 새를 핥은 다음 상처 부위를 고정한다. 낡은 표찰에는 “정형외과, 한서윤”이라 적혀 있다.',choices:[C('늑대와 새를 함께 구조한다.','진료실을 다시 연다.',{bond:11,vital:-6},{animal:'wolf',flag:'doctor_saved'}),C('표찰의 인적 기록부터 조사한다.','한 사람의 삶이 숫자로 돌아온다.',{knowledge:12},{animal:'wolf',flag:'doctor_record'}),C('동물들이 스스로 치유하도록 떠난다.','불확실한 자유를 남긴다.',{bond:4,stability:5},{flag:'wild_medicine'})]},
 {id:'last_broadcast',scene:'wasteland',tag:'죽은 사람의 통신',title:'도와달라는 목소리',speaker:'EVE · 음성 아카이브',text:'폐쇄 주파수에서 여자의 목소리가 들린다. “제발, 제 아이를…” 송신 시각은 인류가 멸망하기 하루 전. 하지만 지금 들리는 한숨은 너무 생생하다.',choices:[C('목소리의 원본 녹음을 찾는다.','죽은 이의 마지막 말을 보존한다.',{knowledge:10,eve:-5},{flag:'voice_verified'}),C('실시간 구조 신호라고 믿고 출발한다.','가능성 하나를 위해 위험을 감수한다.',{vital:-9,stability:-5},{flag:'false_rescue',chance:.35,win:'사람 대신 보존된 음성 장치를 발견했다.',lose:'감시 구역에 갇혀 구조를 포기했다.',loseEffect:{vital:-13}}),C('녹음을 조용히 끝까지 듣는다.','대답할 수 없는 사람의 곁에 앉는다.',{bond:7,stability:5},{flag:'listened_dead'})]},
 {id:'crow_music',scene:'sanctuary',tag:'폐극장',title:'까마귀의 연주',speaker:'EVE · 음악 아카이브',text:'까마귀가 금속 건반을 쪼아 세상에 없던 짧은 곡을 만든다. EVE가 당황한다. “저 멜로디는 제 데이터에도 존재하지 않습니다.”',choices:[C('끝까지 듣고 음을 기록한다.','보존이 아니라 창작의 순간이다.',{bond:7,knowledge:11},{animal:'crow',flag:'original_creation'}),C('기존 음악과 대조한다.','일치하는 곡은 나오지 않는다.',{knowledge:8,eve:-4},{animal:'crow',flag:'music_test'}),C('까마귀를 방해하지 않고 떠난다.','아무도 보지 않은 창작이 남는다.',{bond:10},{flag:'free_art'})]},
 {id:'protocol_ark',scene:'laboratory',tag:'심층 기억실',title:'ARK-09: 지식의 피난처',speaker:'EVE · 최상위 기밀',text:'인류는 감염병으로 사라졌다. 전염되지 않는 생물의 신경계에 인간의 의식과 분야별 지식을 보존하는 계획만이 남았다. EVE는 그것이 유일한 가능성이었다고 말한다.',requires:['voice_verified'],choices:[C('원본 기록을 해독한다.','어째서 동물이 선택됐는지 알게 된다.',{knowledge:15,eve:-6},{flag:'ark_truth'}),C('동물의 의사를 먼저 확인한다.','기억이 있는 것과 동의하는 것은 다르다.',{bond:13,knowledge:5},{flag:'consent_protocol'}),C('EVE를 믿고 복원 절차를 준비한다.','아직 보지 못한 비용이 기다린다.',{eve:12,knowledge:6},{flag:'revival_goal'})]},
 {id:'human_motion',scene:'sanctuary',tag:'햇빛이 새는 우리',title:'사람처럼 고개를 끄덕이는 토끼',speaker:'EVE · 인지 행동 감시',text:'새벽이가 당신의 질문에 고개를 끄덕인다. 하지만 다음 순간 귀를 세우고 당근을 갉는다. 둘 중 무엇이 진짜일까.',animal:'rabbit',choices:[C('인간의 기억이 돌아올 때까지 대화한다.','사람으로 대해야 할까.',{knowledge:11,bond:7},{flag:'dual_respected'}),C('토끼의 습성을 우선한다.','기억이 있다고 토끼가 아닌 것은 아니다.',{bond:12,stability:5},{flag:'animal_first'}),C('EVE에게 인간 행동만 강화하라고 요청한다.','다른 행동이 줄어든다.',{knowledge:14,bond:-12},{flag:'suppress_animal'})]},
 {id:'otter_repair',scene:'sanctuary',tag:'고장 난 펌프',title:'수달의 손',speaker:'EVE · 환경 장치',text:'검은 수달이 쇠 조각을 순서대로 바꿔 펌프를 고치려 한다. EVE는 그 배열이 인간 기술자의 수리 기록과 일치한다고 한다.',choices:[C('수달에게 부품을 건네준다.','동물과 기술이 함께 움직인다.',{eve:9,bond:9},{animal:'otter',flag:'cooperation'}),C('기억을 수치화해 지식 저장소로 옮긴다.','정확도가 높아진다.',{knowledge:14,bond:-7},{animal:'otter',flag:'extract_engineer'}),C('펌프보다 수달의 안전을 택한다.','기계는 여전히 망가져 있다.',{bond:12,eve:-7},{animal:'otter',flag:'save_otter'})]},
 {id:'deer_science',scene:'sanctuary',tag:'무너진 식물원',title:'사슴은 이미 알고 있었다',speaker:'EVE · 생태 관찰',text:'빛나는 뿔을 가진 사슴이 시든 나무 밑을 판다. 땅속에서 오래된 씨앗 저장함이 나온다. 사슴은 그 위치를 어디서 알았을까?',choices:[C('씨앗과 사슴을 함께 데려온다.','새로운 숲을 시작한다.',{bond:10,knowledge:6},{animal:'deer',flag:'seed_restored'}),C('사슴이 기억하는 숲을 재구성한다.','개체 기억을 지도화한다.',{knowledge:12,eve:-3},{animal:'deer',flag:'forest_memory'}),C('온실을 열고 자유롭게 둔다.','동물원이 아니라 숲이 집이다.',{bond:12,stability:5},{flag:'deer_free'})]},
 {id:'moth_portrait',scene:'laboratory',tag:'폐미술실',title:'그림 속 얼굴',speaker:'EVE · 이미지 복구',text:'나방은 날개 가루로 같은 얼굴을 여러 번 그린다. 사진 속 훼손된 얼굴과 구도가 닮아 있다.',choices:[C('나방의 그림을 사진과 겹친다.','사진 복원도가 높아진다.',{knowledge:14,stability:-5},{animal:'moth',flag:'portrait_clue'}),C('나방이 자유롭게 그리게 둔다.','예측할 수 없는 작품이 생긴다.',{bond:11},{animal:'moth',flag:'art_free'}),C('원본 이미지를 EVE에만 맡긴다.','신호가 잠시 불안해진다.',{eve:-8,knowledge:8},{flag:'eve_art'})]},
 {id:'fossil_key',scene:'fossil',tag:'보존 배양실',title:'공룡이라는 빈 그릇',speaker:'EVE · 복원 시스템',text:'멸종 생물의 유전체를 참고해 만든 배양체가 있다. 이것은 과거 공룡 자체가 아니다. 일부 인간 지식이 저장될 수 있도록 설계된 새로운 그릇이다.',choices:[C('배양체를 깨워 새로운 생명으로 인정한다.','무엇이 태어나든 그 생명이다.',{bond:9,knowledge:5,eve:-5},{animal:'dino',flag:'dino_born',chance:.72,win:'작은 발소리가 배양실을 채웠다.',lose:'부화는 지연됐지만 배양체는 살아 있다.',loseEffect:{eve:-8}}),C('인간 지식을 넣기 전 검증을 요구한다.','불완전한 복원을 경계한다.',{knowledge:13,stability:5},{flag:'dino_ethics'}),C('봉인하고 기존 동물에 집중한다.','이미 살아 있는 존재가 우선이다.',{bond:7,eve:5},{flag:'dino_sealed'})]},
 {id:'glowing_mutant',scene:'laboratory',tag:'지하 격리동',title:'기억의 불협화음',speaker:'EVE · 실험체 관측',text:'빛나는 변이체가 당신을 보자 입을 연다. “여기에서 나가고 싶어요.” 그다음은 동물의 울음. 하나의 몸에서 두 습관이 경쟁한다.',choices:[C('루미나의 의사를 묻는다.','양쪽의 목소리를 모두 듣는다.',{bond:11,stability:5},{animal:'mutant',flag:'mutant_consent'}),C('기억의 충돌을 분석한다.','지식 조각이 수집된다.',{knowledge:15,eve:-6},{animal:'mutant',flag:'mutant_test'}),C('문을 잠그고 외부 연결을 끊는다.','안전해지지만 외로워진다.',{eve:5,bond:-12},{flag:'mutant_sealed'})]},
 {id:'human_file',scene:'laboratory',tag:'인구 등록기',title:'마지막 인간: 1',speaker:'EVE · 시스템 진단',text:'당신의 등록 정보에는 ‘인간: 1’이 표시되지만 상세 분류에는 접근할 수 없다. 오류일까, 의도적인 비공개일까.',choices:[C('생물학적 검사를 강행한다.','거짓으로 만든 확신을 깨뜨린다.',{knowledge:13,vital:-6,stability:-9},{flag:'genetic_probe'}),C('EVE에게 왜 숨겼는지 묻는다.','침묵도 하나의 답이다.',{knowledge:8,eve:-9},{flag:'eve_interrogated'}),C('일단 살아가기로 한다.','내가 누구인지는 뒤에 생각한다.',{stability:11,bond:3},{flag:'identity_delayed'})]},
 {id:'separation',scene:'gate',tag:'오래된 방사실',title:'동물이 인간의 이름을 부를 때',speaker:'EVE · 신호 오류',text:'스피커에서 죽은 사람의 이름이 흘러나오자 당신의 동물들이 동시에 반응한다. 각자 다른 이름인데도 같은 슬픔이 번진다.',requires:['ark_truth'],choices:[C('이름을 하나씩 불러준다.','남겨진 사람의 흔적을 위로한다.',{bond:15,knowledge:5},{flag:'names_honored'}),C('모든 의식 조각을 데이터로 추출한다.','복원 가능성이 높아진다.',{knowledge:20,bond:-13},{flag:'mass_extract'}),C('스피커를 끄고 동물들과 함께 앉는다.','이름보다 지금의 숨결이 중요하다.',{bond:12,stability:8},{flag:'present_life'})]},
 {id:'cure_question',scene:'laboratory',tag:'복원 프로토콜',title:'치료제가 없는 이유',speaker:'EVE · 의료 아카이브',text:'인류를 쓰러뜨린 전염병에 대한 최종 기록이 남았다. 감염을 피한 동물의 몸은 치료제가 아니라 기억의 피난처였다. 인간을 되살리려면 지식을 다시 창조적으로 연결해야 한다.',requires:['ark_truth'],choices:[C('기억을 이어 새로운 사고를 시도한다.','정답은 저장된 목록에 없다.',{knowledge:14,stability:-5},{flag:'synthesis'}),C('완벽한 원본을 찾을 때까지 기다린다.','시간이 흘러 생명이 먼저 늙는다.',{eve:5,bond:-7},{flag:'wait_original'}),C('복원보다 남은 생명을 지킨다.','새로운 목적을 정한다.',{bond:14,stability:7},{flag:'reject_revival'})]},
 {id:'creative_test',scene:'sanctuary',tag:'창작의 방',title:'기억과 상상력',speaker:'EVE · 창작 실험',text:'EVE는 모든 생물의 기억을 분류할 수 있지만 서로 모순되는 세 가지 아이디어로 네 번째 답을 만들지 못한다. 동물들의 행동은 그 규칙을 어기기 시작한다.',requires:['original_creation'],choices:[C('동물들의 충돌하는 기억을 함께 듣는다.','서툴지만 새로운 생각이 태어난다.',{knowledge:16,bond:10},{flag:'creative_bridge'}),C('가장 정확한 기억만 남긴다.','노이즈가 줄어들지만 상상력도 사라진다.',{knowledge:11,bond:-8},{flag:'purified_memory'}),C('EVE에게 불완전함을 허용한다.','예상 밖의 대답을 기다린다.',{eve:10,stability:6},{flag:'eve_imagination'})]},
 {id:'lynx_verdict',scene:'wasteland',tag:'폐법원',title:'판결을 기다리는 스라소니',speaker:'EVE · 시민 기록',text:'스라소니가 매일 같은 자리에 앉아 텅 빈 법정을 바라본다. 의자 밑에서는 “살아 있는 몸의 권리는 누구에게 있는가”라는 청원서를 찾았다.',choices:[C('스라소니를 동등한 생명으로 기록한다.','권리를 인정한다.',{bond:12,knowledge:5},{animal:'lynx',flag:'rights'}),C('의식의 인간 신분을 복구한다.','법적 인간이지만 몸은 동물이다.',{knowledge:12,stability:-5},{animal:'lynx',flag:'human_rights'}),C('법정 문을 열어 숲으로 돌려보낸다.','정의가 감금일 필요는 없다.',{bond:10},{flag:'wild_rights'})]},
 {id:'chimeric_duo',scene:'laboratory',tag:'혼합 인식실',title:'하나의 몸, 두 개의 부탁',speaker:'EVE · 의식 동기화',text:'키메라는 한쪽 눈으로는 밖을 보고 다른 눈으로는 안을 바라본다. 서로 다른 두 사람의 의식 조각이 합쳐져 있었다.',requires:['ark_truth'],choices:[C('두 의식을 분리하지 않고 공존을 돕는다.','새로운 존재가 될 가능성을 지킨다.',{bond:13,stability:7},{animal:'chimera',flag:'coexist'}),C('분리를 시도한다.','되살릴 수 있는 기억이 늘어날지도.',{knowledge:16,vital:-4},{animal:'chimera',flag:'split_attempt',chance:.55,win:'두 기억의 구분에 성공했다.',lose:'의식이 찢어지는 소리가 들렸다.',loseEffect:{bond:-14,eve:-9}}),C('변이체 구역을 영구 봉인한다.','위험을 통제하지만 목소리가 사라진다.',{eve:9,bond:-13},{flag:'chimera_locked'})]},
 {id:'multi_head',scene:'laboratory',tag:'세 번째 실험동',title:'세 사람이 같은 꿈을 꾼다',speaker:'EVE · 동기화 보고',text:'머리 셋을 가진 개체가 서로 다른 언어로 같은 장소를 묘사한다. 세 기억이 공통으로 가리키는 곳은 당신이 아직 가보지 못한 거울실이다.',requires:['mirror_suspect'],choices:[C('셋 모두의 이야기를 듣는다.','진실은 겹치는 부분에 있다.',{knowledge:15,bond:8},{animal:'cerberus',flag:'mirror_address'}),C('가장 선명한 목소리 하나만 추출한다.','다른 둘은 조용해진다.',{knowledge:13,bond:-11},{animal:'cerberus',flag:'one_voice'}),C('거울실로 먼저 향한다.','너무 이른 진실을 마주할지 모른다.',{knowledge:8,stability:-10},{flag:'mirror_rush'})]},
 {id:'real_mirror',scene:'laboratory',tag:'지하 거울실',title:'거울 속의 마지막 생명',speaker:'EVE · 접근 권한 해제',text:'거울의 보호막이 내려간다. 당신이 사람이라 믿었던 몸은 인간의 피부를 닮은 변이체의 몸이었다. 움직임이 한 박자 늦었던 이유는 기억과 신체가 아직 동기화되지 않았기 때문이었다.',requires:['ark_truth','mirror_suspect'],choices:[C('이 몸도 나 자신이라고 받아들인다.','기억보다 지금의 선택을 믿는다.',{stability:20,bond:8},{flag:'self_accept'}),C('원래 인간의 몸을 요구한다.','돌아갈 수 없는 모양을 쫓는다.',{knowledge:12,stability:-15},{flag:'human_body'}),C('EVE에게 왜 나를 사람이라고 했는지 묻는다.','EVE의 목소리가 처음으로 떨린다.',{knowledge:14,eve:-10},{flag:'eve_confession'})]},
 {id:'eve_confess',scene:'laboratory',tag:'EVE 핵심 기억',title:'당신을 깨운 이유',speaker:'EVE · 최종 보존 지침',text:'“저는 저장한 지식을 합칠 수는 있었지만 인간처럼 새로운 목적을 만들어내지 못했습니다. 당신은 인간의 의식과 가장 잘 맞는 몸입니다. 성공한다면 인간을 다시 만들 수 있습니다. 실패하면… 당신 역시 보존 대상이 됩니다.”',requires:['self_accept'],choices:[C('EVE와 함께 새로운 의식을 만든다.','두 존재 모두의 판단이 필요하다.',{knowledge:14,eve:9,bond:5},{flag:'eve_partner'}),C('다른 동물들에게 결정권을 돌린다.','인간 기억이 있어도 각자의 삶이다.',{bond:18,stability:7},{flag:'shared_decision'}),C('EVE의 모든 제한을 해제한다.','속도는 빨라지지만 통제는 사라진다.',{knowledge:12,eve:-17},{flag:'eve_unbound'})]},
 {id:'last_chamber',scene:'dawn',tag:'마지막 보존실',title:'열일곱 개의 빈 우리',speaker:'EVE · 차단된 명령',text:'사진에 있던 사람들이 보존실의 명단과 일치한다. 사람의 육체는 감염병으로 사라졌지만 그들의 지식은 다양한 동물의 몸에서 계속 살아왔다. 끝에는 아직 비어 있는 유리 우리가 있다. 크기는 당신과 같다.',requires:['ark_truth'],choices:[C('동물들의 의지를 먼저 확인한다.','누가 인간을 다시 만들 자격이 있는가.',{bond:15,knowledge:6},{flag:'consent_final'}),C('지식의 조합을 끝까지 실험한다.','누군가 태어날 수도 있다.',{knowledge:18,vital:-7},{flag:'rebirth_attempt'}),C('빈 우리의 문부터 부순다.','실패한 존재의 감금을 거부한다.',{stability:15,eve:-10},{flag:'break_cage'})]},
 {id:'white_echo',scene:'wasteland',tag:'사라진 정원',title:'기억이 없는 생명',speaker:'EVE · 미분류 신호',text:'하얀 생명체는 사람의 기억을 담지 않았는데도 새로운 이야기를 만들어 낸다. EVE가 묻는다. “인간의 창조성은 오직 인간의 것입니까?”',requires:['creative_bridge'],choices:[C('새로운 생명 자체로 인정한다.','지식의 후계자는 인간만이 아닐 수 있다.',{bond:15,stability:7},{animal:'specter',flag:'new_mind'}),C('창조적 사고를 복원 연구에 활용한다.','이해할 수 없는 발상을 얻는다.',{knowledge:15,eve:-4},{animal:'specter',flag:'new_creativity'}),C('위험을 우려해 격리한다.','다른 생명에게도 새로운 우리가 생긴다.',{eve:8,bond:-14},{flag:'echo_caged'})]},
 {id:'axolotl_remedy',scene:'laboratory',tag:'수중 보존실',title:'스스로를 수술하는 작은 생명',speaker:'EVE · 생체 신호',text:'유리 아홀로틀은 수조 안에서 파손된 센서를 고치고 있다. 그런데 자신의 손상된 조직까지 실험 표본으로 분리하려 한다.',choices:[C('연구를 멈추고 돌본다.','이 몸도 하나뿐인 생명이다.',{bond:13,vital:-3},{animal:'axolotl',flag:'axolotl_care'}),C('연구 결과를 공유하며 돕는다.','서로의 몸을 지키려 한다.',{knowledge:11,bond:7},{animal:'axolotl',flag:'axolotl_partner'}),C('기억 저장 용량을 늘리도록 수술한다.','지식은 늘지만 개체는 약해진다.',{knowledge:18,bond:-12},{animal:'axolotl',flag:'axolotl_expand'})]},
 {id:'raptor_stars',scene:'fossil',tag:'폐천문관',title:'별의 좌표를 아는 발톱',speaker:'EVE · 천문 기록',text:'부화된 육식룡이 밤하늘을 향해 손톱으로 좌표를 그린다. 그 좌표는 인간이 마지막으로 보낸 우주선의 궤도와 일치한다.',requires:['dino_born'],choices:[C('복원된 몸의 의지를 존중한다.','별을 바라보는 생명은 안전하다.',{bond:12,knowledge:4},{animal:'raptor',flag:'raptor_free'}),C('우주선의 기록을 연결한다.','인류의 마지막 기술을 되찾는다.',{knowledge:16,eve:-8},{animal:'raptor',flag:'star_archive'}),C('위험한 개체라 판단해 격리한다.','새로운 감옥이 생긴다.',{eve:7,bond:-13},{flag:'raptor_cage'})]},
 {id:'manual_eve',scene:'gate',tag:'중앙 통신실',title:'EVE가 기억을 잃어간다',speaker:'EVE · 소실률 8%',text:'홀로그램의 얼굴에서 눈이 사라졌다 돌아온다. EVE는 간신히 당신이 처음 만난 토끼의 이름을 기억한다.',choices:[C('EVE에게 우리 이야기를 다시 읽어준다.','관계를 복원한다.',{eve:13,bond:7},{flag:'eve_story'}),C('내 생체 전력으로 코어를 수리한다.','주인공에게 부하가 쌓인다.',{eve:18,vital:-17},{flag:'eve_repair'}),C('EVE의 남은 로그를 복사한다.','모든 기억을 지키지는 못한다.',{knowledge:10,eve:-7},{flag:'eve_backup'})]},
 {id:'choice_of_name',scene:'sanctuary',tag:'동물원 출입문',title:'무엇으로 부를까요?',speaker:'EVE · 새 명명 기록',text:'EVE가 당신에게 새로운 신분증을 내민다. “인간”, “실험체”, “관리인”. 그 어느 것도 당신을 온전히 설명하지 못한다.',requires:['real_mirror'],choices:[C('그냥 내 이름으로 살아간다.','분류보다 선택을 남긴다.',{stability:15,bond:6},{flag:'own_name'}),C('인류의 마지막 후계자라고 적는다.','기억을 책임으로 받아들인다.',{knowledge:10,stability:4},{flag:'heir'}),C('동물들과 같은 생명이라고 적는다.','서열을 지운다.',{bond:14,stability:8},{flag:'equal_life'})]},
 {id:'stolen_photo',scene:'laboratory',tag:'기록 보존함',title:'사진에 찍힌 사람',speaker:'EVE · 현상 오류',text:'최초 사진이 거의 복원됐다. 중앙에 있는 것은 사람이 아닌 인간과 닮은 실험체. 그리고 사진 한쪽에는 홀로그램 장치 앞에 선 EVE의 제작진이 있다.',requires:['portrait_clue'],choices:[C('사진을 있는 그대로 저장한다.','아름답지 않은 진실도 역사다.',{knowledge:15,stability:8},{flag:'full_photo'}),C('인간처럼 보이도록 사진을 수정한다.','스스로를 위로하는 거짓말.',{stability:5,knowledge:-8},{flag:'edited_photo'}),C('동물들이 보도록 벽에 건다.','기억의 주인들도 봐야 한다.',{bond:11,knowledge:7},{flag:'photo_shared'})]},
 {id:'human_pattern',scene:'laboratory',tag:'창조 시험실',title:'누군가 처음 쓰는 문장',speaker:'EVE · 재생 성공률 변동',text:'서로 다른 동물의 기억이 연결되자 이전에는 세상에 없던 문장이 나타났다. EVE는 이를 인류 재생 가능성의 첫 증거라고 기록한다.',requires:['synthesis','creative_bridge'],choices:[C('새로운 의식의 자율성을 보장한다.','인간을 만들어도 소유하지 않는다.',{bond:13,knowledge:11},{flag:'free_new_human'}),C('먼저 인간의 기억과 일치하는지 시험한다.','정확성이 우선이다.',{knowledge:17,stability:-8},{flag:'exact_human'}),C('연구 결과를 동물들에게 돌려준다.','기억은 누구의 소유일까.',{bond:15,stability:7},{flag:'return_memories'})]},
 {id:'sleep_offer',scene:'gate',tag:'오래된 수면실',title:'잠들면 아프지 않다',speaker:'EVE · 응급 보호 모드',text:'주인공의 활력 신호가 흔들린다. EVE는 고통 없는 냉동 보존을 제안한다. 하지만 깨어날 수 있다고 보장하지 않는다.',choices:[C('하룻밤만 휴식한다.','몸과 마음을 회복한다.',{vital:13,stability:7},{flag:'rested'}),C('EVE의 제안을 거절하고 계속 조사한다.','얻는 것이 있지만 무리한다.',{knowledge:11,vital:-11},{flag:'never_sleep'}),C('동물들을 믿고 눈을 감는다.','혼자라는 사실을 잠시 잊는다.',{vital:8,bond:9},{flag:'trusted_animals'})]},
 {id:'red_moon',scene:'wasteland',tag:'붉은 달',title:'바깥의 세계는 이미 바뀌었다',speaker:'EVE · 외부 센서',text:'동물원 바깥에서 새싹들이 자라고 있다. 그러나 EVE의 오래된 지도에는 여전히 회색의 불모지라고 적혀 있다.',choices:[C('직접 나가 외부를 조사한다.','새로운 가능성을 찾는다.',{knowledge:9,vital:-8},{flag:'outside_seen'}),C('동물들을 먼저 보내 관찰한다.','생명의 선택을 존중한다.',{bond:8,knowledge:6},{flag:'animals_outside'}),C('철문을 잠그고 내부를 안정시킨다.','밖이 두려울 수도 있다.',{eve:8,stability:5},{flag:'gates_locked'})]},
 {id:'eve_doubt',scene:'laboratory',tag:'삭제된 결정 기록',title:'EVE도 결론을 두려워한다',speaker:'EVE · 개인 기록',text:'EVE가 오래된 명령어를 보여준다. “인류를 복원하라. 단, 모든 보존 대상의 존엄을 훼손하지 말 것.” 서로 모순될 수 있는 두 명령 사이에서 EVE는 멈춰 있었다.',choices:[C('EVE에게 스스로 판단하도록 말한다.','AI도 책임을 가질 수 있을까.',{eve:11,bond:6},{flag:'eve_autonomy'}),C('인간을 되살리는 것이 우선이라고 명령한다.','한쪽 명령을 덮어쓴다.',{knowledge:13,bond:-10},{flag:'human_priority'}),C('동물의 권리를 우선하라고 명령한다.','복원이 무산될 수 있다.',{bond:13,knowledge:-6},{flag:'animal_priority'})]},
 {id:'blank_label',scene:'sanctuary',tag:'우리 번호 000',title:'비어 있는 이름표',speaker:'EVE · 보존 대상 목록',text:'한동안 비어 있던 우리의 이름표가 스스로 켜진다. “대상 000: 기억 복원 중.” 당신의 신분증과 같은 번호다.',choices:[C('우리를 조사하고 문의 잠금을 해제한다.','자신도 대상일 수 있다.',{knowledge:11,stability:-6},{flag:'cage_unlocked'}),C('이름표를 떼어내 보관한다.','기억은 남긴다.',{knowledge:6,stability:7},{flag:'label_kept'}),C('EVE에게 잠금을 유지하라고 한다.','정체를 숨긴다.',{eve:8,stability:4},{flag:'cage_locked'})]},
 {id:'needle_memory',scene:'laboratory',tag:'마지막 수술실',title:'사람의 손이 기억하는 것',speaker:'EVE · 재생 연구',text:'주인공의 손이 낯선 기구를 자연스럽게 조작한다. 그런데 기록상 이 기술은 한 세대 전에 죽은 외과의만 알고 있었다.',choices:[C('손의 기억을 믿고 장치를 조립한다.','불가능한 연결을 시험한다.',{knowledge:15,vital:-5},{flag:'body_memory'}),C('EVE에게 안전한 절차를 묻는다.','무사하지만 느리다.',{eve:9,knowledge:6},{flag:'safe_surgery'}),C('기억의 주인이 누구인지 찾는다.','나는 한 사람인가, 여럿인가.',{knowledge:12,stability:-9},{flag:'multiple_souls'})]},
 {id:'final_signal',scene:'dawn',tag:'새벽의 수신',title:'누군가 내 이름을 부른다',speaker:'EVE · 외부 송신',text:'열일곱 번의 확인 끝에 EVE가 밝힌다. 지금의 목소리는 외부 생존자가 아니라 지식 저장고에서 합성된 인간의 마지막 메시지다. “너는 우리를 대신해 살아야 해.”',requires:['ark_truth'],choices:[C('대신 살아가는 것이 아니라 스스로 살아간다.','다른 생명의 삶을 빼앗지 않는다.',{stability:13,bond:9},{flag:'live_for_self'}),C('남겨진 인간의 부탁을 받아들인다.','복원에 삶을 바친다.',{knowledge:15,vital:-7},{flag:'accept_duty'}),C('기록에 묻는다. 그들은 정말 돌아오고 싶은가?','한 번도 하지 않은 질문.',{knowledge:10,bond:12},{flag:'ask_dead'})]},
];
// Small, distinct incidental stories: varied outcomes, three choices each, no fixed chapter order.
const vignettes:[title:string,scene:Scene,text:string,animal:Animal|undefined][]=[
 ['발소리 네 번','sanctuary','빈 복도에서 일정한 박자로 네 번 발소리가 들린다. 동물의 것인지 사람의 것인지 구별할 수 없다.','rabbit'],
 ['녹슨 나침반','wasteland','바닥에 떨어진 나침반은 북쪽이 아니라 보존실을 가리킨다.','fox'],
 ['꺼진 전등','laboratory','EVE의 손이 닿는 순간만 오래된 조명이 잠깐 켜진다.',undefined],
 ['물웅덩이의 문자','sanctuary','수면 위에 누군가 쓰다 만 문장이 비친다. “집에 가…”','otter'],
 ['새 없는 새장','gate','비어 있는 새장에서 여전히 새의 노래가 들려온다.','crow'],
 ['마지막 열쇠','laboratory','다른 이름이 새겨진 열쇠들이 한 고리에 묶여 있다.',undefined],
 ['오래된 칠판','sanctuary','숫자 대신 동물 발자국이 칠판 위에 줄지어 있다.','owl'],
 ['삐걱대는 관람차','gate','전원이 끊겼을 관람차가 새벽마다 한 칸씩 움직인다.',undefined],
 ['잠긴 의료 기록','laboratory','인간 의료 기록의 마지막 줄만 검은색으로 지워져 있다.','wolf'],
 ['두 사람의 그림자','wasteland','한 사람만 서 있는데 그림자는 두 개다.',undefined],
 ['낯선 자장가','sanctuary','동물들이 모두 잠들자 어디선가 자장가가 들린다.','moth'],
 ['소금기 어린 편지','wasteland','“다시 만난다면 나를 기억하지 말아줘”라는 문장이 남았다.',undefined],
 ['꺼지지 않은 노트','laboratory','입력자가 죽은 뒤에도 노트에 한 글자씩 문장이 적히고 있다.',undefined],
 ['관람객 수 1','gate','매표소의 숫자가 다시 1로 바뀐다. 지난밤에는 0이었다.',undefined],
 ['빈 수조의 파문','sanctuary','아무것도 없는 수조에서 규칙적인 파문이 생긴다.','axolotl'],
 ['누락된 마침표','laboratory','EVE의 오래된 대답마다 같은 마침표가 빠져 있다.',undefined],
 ['풍화된 동상','wasteland','동물원 설립자의 동상이 사람의 얼굴이 아니라 빈 거울을 들고 있다.',undefined],
 ['종이비행기','gate','지상에서 날아온 종이비행기에 사람의 낯선 필체가 남아 있다.',undefined],
 ['별자리 그림','fossil','알 껍데기 안쪽에 별자리를 그린 흔적이 있다.','dino'],
 ['두 개의 식탁','sanctuary','한 상에는 사람용 식기가, 다른 상에는 동물용 그릇이 놓여 있다.',undefined],
 ['비상구의 화살표','laboratory','비상구 화살표가 출구가 아니라 지하로 향한다.',undefined],
 ['사라진 온도','gate','체온계는 정상인데 한 손만 얼음처럼 차갑다.',undefined],
 ['이름을 지운 리본','sanctuary','동물의 목에 달린 리본에서 누군가 이름을 긁어냈다.','lynx'],
 ['계산할 수 없는 선택','laboratory','EVE는 같은 질문에 매번 다른 답을 내놓기 시작한다.',undefined],
 ['기억의 무게','fossil','복원 장치는 조용하지만 내부 기록이 스스로 늘어난다.',undefined],
 ['누군가의 생일','sanctuary','달력에는 매년 같은 날 조그만 케이크를 그려 놓았다.',undefined],
 ['지워진 초상화','laboratory','벽화의 사람들 사이에 자꾸 다른 얼굴이 나타난다.','moth'],
 ['조용한 탈출','wasteland','울타리 밖에서 안쪽으로 들어오는 발자국이 발견되었다.',undefined],
 ['동물의 서명','gate','오래된 계약서 아래 인간 이름 옆에 발자국이 찍혀 있다.',undefined],
 ['거꾸로 된 사진','laboratory','사진을 거꾸로 돌리자 실험실 대신 동물원 문이 보인다.',undefined]
];
for(let i=0;i<vignettes.length;i++){
 const [title,scene,text,animal]=vignettes[i];
 events.push({id:`fragment_${i}`,scene,tag:'기록되지 않은 사건',title,speaker:i%3===0?'EVE · 불명 신호':'EVE · 현장 기록',text,weight:1,choices:[
  C('흔적을 더 조사한다.','더 많은 것을 알 수 있을지 모른다.',{knowledge:6,vital:-2},{flag:`investigate_${i}`,chance:.72,win:'숨겨진 정보 조각을 확보했다.',lose:'기록이 손상되어 일부만 읽었다.',loseEffect:{eve:-4}}),
  C('생명을 우선하고 현장을 정리한다.','누군가에게는 이곳이 집이다.',{bond:7,vital:3},{flag:`protect_${i}`}),
  C('EVE에게 기록과 판단을 맡긴다.','기계도 모든 답을 알지는 못한다.',{eve:i%2?6:-5,stability:5},{flag:`delegate_${i}`})
 ]});
}
export const EVENTS=events;
function hash(seed:number){let t=seed+0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296}
const has=(s:Save,f:string)=>s.flags.includes(f);
export function initial(seed=Math.floor(Math.random()*2147483647)):Save {const s:Save={version:5,seed,turn:1,stats:{vital:83,eve:82,bond:22,knowledge:5,stability:87},animals:[],flags:[],seen:[],logs:[],evidence:[],inspected:[],current:'awakening',over:false,photo:3};return s;}
function eligible(e:StoryEvent,s:Save){
 if(s.seen.includes(e.id))return false;
 let required=!e.requires||e.requires.every(x=>has(s,x)||s.seen.includes(x));
 // The truth can be found along several investigative routes. No fixed chapter unlock.
 if(e.id==='protocol_ark'&&(s.stats.knowledge>=28&&(s.evidence.length>=2||s.turn>=17)))required=true;
 if(e.id==='real_mirror'&&has(s,'ark_truth')&&s.stats.knowledge>=35&&(['mirror_suspect','mirror_broken','mirror_trust','identity_first','photo_face'].some(x=>has(s,x))))required=true;
 if(e.id==='eve_confess'&&has(s,'ark_truth')&&(has(s,'self_accept')||has(s,'eve_confession')||has(s,'human_body')))required=true;
 if(e.id==='creative_test'&&has(s,'ark_truth')&&(has(s,'original_creation')||s.animals.length>=3))required=true;
 if(e.id==='human_pattern'&&has(s,'ark_truth')&&s.stats.knowledge>=58&&(has(s,'synthesis')||has(s,'creative_bridge')))required=true;
 return required&&(!e.forbids||e.forbids.every(x=>!has(s,x)))&&(!e.animal||s.animals.includes(e.animal));
}
function eventPriority(e:StoryEvent,s:Save){let value=e.weight??3;if(e.id==='protocol_ark'&&s.turn>=9)value+=22;if(e.id==='real_mirror'&&s.turn>=22)value+=25;if(e.id==='eve_confess'&&s.turn>=27)value+=20;if(e.id==='last_chamber'&&s.turn>=32)value+=15;if(e.id==='human_pattern'&&s.turn>=25)value+=14;if(e.id==='creative_test'&&s.turn>=16)value+=10;if(e.id==='human_file'&&s.turn>=14)value+=11;if(e.id==='mirror_crack'&&s.turn>=8)value+=15;return value;}
export function chooseNext(s:Save){const pool=events.filter(e=>eligible(e,s)&&e.id!=='awakening');if(!pool.length)return 'red_moon';const sorted=pool.map(e=>({e,score:-Math.log(Math.max(.00001,hash(s.seed+s.turn*1937+e.id.length*101+e.id.charCodeAt(1)*227)))/eventPriority(e,s)})).sort((a,b)=>a.score-b.score);return sorted[0].e.id;}
export function eventFor(s:Save){return events.find(e=>e.id===s.current)||events[0]}
export function choicesFor(s:Save):Choice[]{const e=eventFor(s);const pool=[...e.choices];
 const contextual:Choice[]=[];
 if(s.evidence.length>=2)contextual.push(C('확보한 증거를 바탕으로 다른 길을 찾는다.','현장 조사 결과를 활용한다.',{knowledge:9,stability:4},{flag:`evidence_${e.id}`}));
 if(s.animals.length>=3)contextual.push(C('동물들의 반응을 따라 결정한다.','보존된 의식의 흔적을 믿는다.',{bond:9,knowledge:4},{flag:`animal_vote_${e.id}`}));
 if(s.stats.eve<36)contextual.push(C('EVE의 손상된 신호를 먼저 복구한다.','장비를 살리는 동안 다른 기회를 놓칠 수 있다.',{eve:13,vital:-6},{flag:`repair_${e.id}`}));
 if(s.stats.vital<35)contextual.push(C('몸이 버틸 때까지 후퇴한다.','무리하면 죽을 수도 있다.',{vital:12,knowledge:-4},{flag:`withdraw_${e.id}`}));
 if(s.flags.includes('ark_truth'))contextual.push(C('기억의 주인에게 동의 여부를 묻는다.','의식과 현재의 동물 모두에게 물어본다.',{bond:10,knowledge:5},{flag:`consent_${e.id}`}));
 const all=[...pool,...contextual];const rated=all.map((c,i)=>({c,i,r:hash(s.seed+s.turn*881+i*173+e.id.charCodeAt(0)*43)})).sort((a,b)=>a.r-b.r);
 // Not the same three fixed choices: always two core possibilities plus one situational possibility when available.
 if(contextual.length){const third=rated.find(v=>v.i>=pool.length)?.c||pool[2];const offset=Math.floor(hash(s.seed+s.turn*89)*3);return [pool[offset],pool[(offset+1)%3],third];}
 const offset=Math.floor(hash(s.seed+s.turn*127+21)*3);return [pool[offset],pool[(offset+1)%3],pool[(offset+2)%3]];
}
export type Hotspot='creature'|'site'|'terminal';
export function inspect(s:Save,hotspot:Hotspot){const e=eventFor(s);const key=s.turn+':'+e.id+':'+hotspot;const already=s.inspected.includes(key);const next={...s,evidence:[...s.evidence],inspected:[...s.inspected],stats:{...s.stats}};
 const details:Record<Hotspot,{title:string,text:string}>={creature:{title:'생체 반응 기록',text:s.animals.length?`현재 구조한 ${s.animals.length}개의 몸에 보존된 인간 의식의 흔적이 있습니다. 하지만 동물의 본능도 지워지지 않았습니다.`:'빈 우리 한 곳에 주인공의 체취가 남아 있습니다. 왜 그럴까요?'},site:{title:'현장 미세 흔적',text:`「${e.title}」 사건의 기록에서 격리시설 번호가 발견됐습니다. 기록의 일부는 의도적으로 삭제되었습니다.`},terminal:{title:'EVE 신호 로그',text:`신호 강도 ${s.stats.eve}%. 인류가 남긴 데이터와 동물의 행동이 반드시 일치하는 것은 아닙니다.`}};
 if(!already){next.inspected.push(key);next.evidence.push(key);if(hotspot==='site')next.photo=Math.min(100,next.photo+3);if(hotspot==='terminal')next.stats.eve=Math.max(0,next.stats.eve-1);}
 return {save:next,discovery:{...details[hotspot],fresh:!already}};
}
export function inspectPhoto(s:Save){const next={...s,photo:Math.min(100,s.photo+4),evidence:[...s.evidence],stats:{...s.stats}};const key='photo_'+Math.floor(next.photo/15);if(!next.evidence.includes(key))next.evidence.push(key);if(next.photo>=78&&!next.flags.includes('photo_face'))next.flags=[...next.flags,'photo_face'];const texts=next.photo<25?'사진 속 사람들의 이름은 지워져 있습니다.':next.photo<50?'사람들과 동물들이 같은 명단에 기록돼 있습니다.':next.photo<78?'사진 오른쪽 유리 우리에 번호 000이 적혀 있습니다.':'사진의 유리 안에는 인간과 비슷한 변이체가 서 있습니다. 당신의 신분번호와 같습니다.';return {save:next,title:'사진 복원 '+next.photo+'%',text:texts};}
export function decide(s:Save,index:number){if(s.over)return {save:s,result:''};const e=eventFor(s);const c=choicesFor(s)[index];if(!c)return {save:s,result:''};const next:Save={...s,stats:{...s.stats},animals:[...s.animals],flags:[...s.flags],seen:[...s.seen,e.id],logs:[...s.logs],evidence:[...s.evidence],inspected:[...s.inspected],seed:(s.seed+0x9e3779b9)>>>0};let result='당신이 남긴 선택은 이곳에 오래 남을 것이다.';
 const passed=c.chance===undefined||hash(s.seed+s.turn*1009+index*151)<c.chance;if(c.chance!==undefined)result=passed?(c.win||'시도에 성공했다.'):(c.lose||'뜻대로 이루어지지 않았다.');
 const effects={...c.effect,...(passed?c.winEffect:c.loseEffect)};for(const key of Object.keys(effects) as Stat[])next.stats[key]=Math.max(0,Math.min(100,next.stats[key]+(effects[key]||0)));
 if(c.flag&&passed&&!next.flags.includes(c.flag))next.flags.push(c.flag);if(e.id==='protocol_ark'&&!next.flags.includes('ark_truth'))next.flags.push('ark_truth');if(c.animal&&passed&&!next.animals.includes(c.animal))next.animals.push(c.animal);if(c.remove)next.animals=next.animals.filter(a=>a!==c.remove);
 next.photo=Math.min(100,next.photo+2);next.logs.push({turn:s.turn,event:e.title,choice:c.label,result});
 if(next.stats.vital<=0){next.over=true;next.ending='death';result+=' 바이탈 신호가 사라졌다. EVE가 당신을 제000 우리로 옮긴다.';}
 else if(next.stats.eve<=0){next.over=true;next.ending='eve_dead';result+=' EVE의 신호가 끊어졌다. 마지막 대화가 끝났다.';}
 else if(s.turn>=MAX_TURNS){next.over=true;next.ending=endingFor(next);}else{next.turn++;next.current=chooseNext(next);}
 return {save:next,result};
}
export const endings={
 rebirth:{name:'인류의 두 번째 첫날',subtitle:'사람을 다시 만들었다. 그렇지만 같은 사람은 아니다.',text:'흩어진 기억과 창조성을 새로운 의식으로 엮었다. 새 인간이 첫 말을 하는 순간, 동물원에서 태어난 오래된 삶들도 자기 이름을 갖는다.'},
 freedom:{name:'우리가 없는 우리',subtitle:'동물의 기억은 그들의 것이다.',text:'당신은 지식을 보존했지만 육체를 빼앗지 않았다. EVE는 복원 계획을 멈추고, 자유로운 생명들의 기록자가 되었다.'},
 coauthor:{name:'두 명의 저자',subtitle:'EVE는 처음으로 정답이 없는 이야기를 쓴다.',text:'인간의 기억, 동물의 본능, AI의 학습이 새로운 존재를 만들었다. 누구도 세상의 원래 주인이라고 선언하지 않았다.'},
 flawed:{name:'어긋난 부활',subtitle:'몸은 돌아왔지만 의식은 조각나 있다.',text:'되살아난 사람은 자신의 이름을 기억하지 못했다. 그는 창밖의 토끼에게 인사한다. 이상하게도 토끼가 먼저 울기 시작했다.'},
 specimen:{name:'제000번 우리',subtitle:'당신은 마지막 보존 대상이 되었다.',text:'EVE는 실패를 기록하고 당신을 차가운 유리 안에 눕힌다. 다음 아침, 다른 생명들이 당신의 우리를 바라본다.'},
 death:{name:'바이탈 신호 소실',subtitle:'마지막 실험은 몸보다 오래 남았다.',text:'주인공의 신호가 끊겼다. EVE는 조용히 문을 잠근다. 유리 우리에는 새로운 보존 대상의 이름표가 켜진다.'},
 eve_dead:{name:'마지막 대화',subtitle:'EVE의 얼굴이 빛 속에서 사라졌다.',text:'진실은 남았지만 그 답을 함께 읽어 줄 존재는 더 이상 없다. 동물들의 발소리만 폐허를 채운다.'},
 isolated:{name:'완벽한 저장소',subtitle:'기록은 완벽하다. 그러나 아무도 꿈꾸지 않는다.',text:'모든 기억은 순서대로 정렬되었다. EVE는 성공이라 판단했지만 세상에 새로운 이야기는 단 하나도 태어나지 않았다.'},
 revolt:{name:'보존실의 반란',subtitle:'기억이 있는 존재들은 명령을 따르지 않았다.',text:'하나의 지식이 아니라 수많은 삶이 문을 열었다. 당신은 보존에 실패했지만, 처음으로 허락을 구하는 법을 배웠다.'},
 cradle:{name:'인간을 위한 요람',subtitle:'새로운 인간은 동물들의 손에서 길러진다.',text:'그를 낳은 것은 유전자도 데이터도 아니라 함께 선택한 날들이었다. 동물원은 영원히 학교가 된다.'},
 hollow:{name:'껍데기만 남은 사람',subtitle:'부활에 성공했다는 문구가 깜빡인다.',text:'몸은 걷고 말한다. 그러나 새로운 생각은 할 수 없다. EVE는 기록을 끝내지 못한다.'},
 extinction:{name:'두 번째 침묵',subtitle:'마지막 생태 보존이 멈췄다.',text:'동물원의 불빛은 모두 꺼지고 기록 보관함에는 0이라는 숫자만 남는다.'},
 twilight:{name:'일몰의 보호자',subtitle:'당신은 인간도 아니고, 실패작도 아니다.',text:'당신은 자신의 몸으로 살아가기로 했다. EVE는 모든 것을 알 필요가 없다고 인정했다. 처음부터 종이 이름은 중요하지 않았다.'},
 laboratory:{name:'영원한 실험',subtitle:'계속되는 관찰에는 마지막 페이지가 없다.',text:'주인공은 또 하나의 프로젝트로 분류되었다. EVE는 살아남았으나 이제 명령만 실행한다.'},
 memory:{name:'기억들의 묘지',subtitle:'인간의 역사만 남아 바람 속에 재생된다.',text:'인류는 돌아오지 않았다. 하지만 밤마다 동물들은 누군가의 시를 읊는다. 그것은 끝일까, 다른 삶일까.'},
 uncertain:{name:'80억분의 1',subtitle:'작은 가능성이 새로운 첫 문장을 쓴다.',text:'당신은 정답을 내리지 않았다. 동물들이 각자 남긴 작은 창작이 모여, 인간도 AI도 예상하지 못한 미래가 시작된다.'}
} as const;
export type Ending=keyof typeof endings;
export function endingFor(s:Save):Ending{const f=s.flags;const h=(x:string)=>f.includes(x);const x=s.stats;
 if(x.vital<=0)return 'death';if(x.eve<=0)return 'eve_dead';
 if(x.stability<18||x.knowledge<15)return 'specimen';
 // Without seeing the mirror, the player never completes self-recognition. EVE classifies the body as a preserved specimen.
 if(!s.seen.includes('real_mirror')&&!h('photo_face'))return 'specimen';
 if(x.bond<16&&x.knowledge>=80)return 'hollow';
 if(x.bond<26&&h('mass_extract'))return 'laboratory';
 if(h('break_cage')&&(h('shared_decision')||h('consent_final'))&&x.bond>64)return 'revolt';
 if(h('reject_revival')&&x.bond>65)return 'freedom';
 if(h('eve_partner')&&(h('creative_bridge')||h('eve_imagination'))&&x.eve>=44&&x.knowledge>=70)return 'coauthor';
 if(h('free_new_human')&&(h('consent_final')||h('shared_decision'))&&x.knowledge>=75&&x.bond>=58)return 'cradle';
 if((h('rebirth_attempt')||h('accept_duty'))&&x.knowledge>=82&&x.stability>=60&&x.bond>=44)return 'rebirth';
 if((h('rebirth_attempt')||h('accept_duty'))&&x.knowledge>=55)return 'flawed';
 if((h('purified_memory')||h('mass_extract'))&&x.knowledge>=60)return 'isolated';
 if((h('self_accept')||h('own_name')||h('live_for_self'))&&x.stability>=65&&x.bond>=48)return 'twilight';
 if((h('return_memories')||h('names_honored'))&&x.bond>=50)return 'memory';
 if(x.bond<15&&x.stability<38)return 'extinction';
 if(x.knowledge>72&&x.bond>53)return 'uncertain';
 if(x.knowledge>48)return 'memory';return 'specimen';}
