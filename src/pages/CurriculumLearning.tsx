import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Clock, Users, GraduationCap, Atom, Globe2, Palette, Calculator, Code, History, Music, Dumbbell, Leaf } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Lithuanian school curriculum structure
const gradeGroups = [
  { id: 'primary', label: 'Pradinė (1-4)', grades: ['1', '2', '3', '4'] },
  { id: 'middle', label: 'Pagrindinė (5-8)', grades: ['5', '6', '7', '8'] },
  { id: 'secondary', label: 'Vidurinė (9-10)', grades: ['9', '10'] },
  { id: 'gymnasium', label: 'Gimnazija (11-12)', grades: ['11', '12'] },
];

interface CurriculumSubject {
  id: string;
  title: string;
  titleLt: string;
  icon: any;
  grades: string[];
  description: string;
  descriptionLt: string;
  topics: { grade: string; topics: string[] }[];
}

const curriculumSubjects: CurriculumSubject[] = [
  {
    id: 'matematika',
    title: 'Mathematics',
    titleLt: 'Matematika',
    icon: Calculator,
    grades: ['1','2','3','4','5','6','7','8','9','10','11','12'],
    description: 'Arithmetic, algebra, geometry, statistics, and calculus.',
    descriptionLt: 'Aritmetika, algebra, geometrija, statistika ir analizė.',
    topics: [
      { grade: '5', topics: ['Natūralieji skaičiai', 'Trupmenos', 'Dešimtainės trupmenos', 'Geometrinės figūros', 'Plotas ir perimetras'] },
      { grade: '6', topics: ['Teigiami ir neigiami skaičiai', 'Lygtys', 'Proporcijos', 'Procentai', 'Trikampiai'] },
      { grade: '7', topics: ['Algebrinės išraiškos', 'Tiesinės lygtys', 'Funkcijos', 'Statistika', 'Keturkampiai'] },
      { grade: '8', topics: ['Kvadratinės lygtys', 'Nelygybės', 'Pitagoro teorema', 'Apskritimas', 'Tikimybės'] },
      { grade: '9', topics: ['Skaičių aibės', 'Kvadratinė funkcija', 'Trigonometrija', 'Vektoriai', 'Kombinatorika'] },
      { grade: '10', topics: ['Rodiklinė funkcija', 'Logaritmai', 'Sekos', 'Sterometrija', 'Išvestinė'] },
      { grade: '11', topics: ['Ribos', 'Išvestinė ir jos taikymas', 'Integralai', 'Tikimybių teorija', 'Kompleksiniai skaičiai'] },
      { grade: '12', topics: ['Integralų taikymas', 'Diferencialinės lygtys', 'Erdvinė geometrija', 'Matematinė analizė', 'Egzamino ruošimas'] },
    ]
  },
  {
    id: 'lietuviu-kalba',
    title: 'Lithuanian Language',
    titleLt: 'Lietuvių kalba',
    icon: BookOpen,
    grades: ['1','2','3','4','5','6','7','8','9','10','11','12'],
    description: 'Grammar, literature, writing, and communication.',
    descriptionLt: 'Gramatika, literatūra, rašymas ir komunikacija.',
    topics: [
      { grade: '5', topics: ['Kalbos dalys', 'Rašyba', 'Pasakos ir mitai', 'Tekstų kūrimas', 'Skaitymo strategijos'] },
      { grade: '6', topics: ['Sintaksė', 'Skyryba', 'Eilėraščiai', 'Aprašymas', 'Dialogas'] },
      { grade: '7', topics: ['Žodžių daryba', 'Frazeologizmai', 'Novelė', 'Argumentuotas rašymas', 'Viešasis kalbėjimas'] },
      { grade: '8', topics: ['Stilistika', 'Publicistika', 'Drama', 'Samprotavimas', 'Kalbos kultūra'] },
      { grade: '9', topics: ['Senovės literatūra', 'Renesansas', 'Klasicizmas', 'Analitinis rašinys', 'Retorika'] },
      { grade: '10', topics: ['Romantizmas', 'Realizmas', 'Modernizmas', 'Interpretacija', 'Recenzija'] },
      { grade: '11', topics: ['XX a. lietuvių literatūra', 'Egzodo literatūra', 'Lyginamoji analizė', 'Esė', 'Diskusija'] },
      { grade: '12', topics: ['Šiuolaikinė literatūra', 'Brandos egzamino rašinys', 'Kritinė analizė', 'Kūrybinis rašymas', 'Egzamino ruošimas'] },
    ]
  },
  {
    id: 'anglu-kalba',
    title: 'English Language',
    titleLt: 'Anglų kalba',
    icon: Globe2,
    grades: ['1','2','3','4','5','6','7','8','9','10','11','12'],
    description: 'English grammar, vocabulary, reading, and communication.',
    descriptionLt: 'Anglų kalbos gramatika, žodynas, skaitymas ir bendravimas.',
    topics: [
      { grade: '5', topics: ['Present Simple & Continuous', 'School vocabulary', 'Reading comprehension', 'Writing letters', 'Listening'] },
      { grade: '6', topics: ['Past Simple', 'Comparatives', 'Travel & countries', 'Story writing', 'Pronunciation'] },
      { grade: '7', topics: ['Present Perfect', 'Modal verbs', 'Media & technology', 'Essay writing', 'Debates'] },
      { grade: '8', topics: ['Passive voice', 'Conditionals', 'Environment', 'Report writing', 'Presentations'] },
      { grade: '9', topics: ['Advanced tenses', 'Phrasal verbs', 'Global issues', 'Argumentative essay', 'Critical reading'] },
      { grade: '10', topics: ['Complex grammar', 'Idioms', 'Culture & society', 'Formal writing', 'Academic English'] },
      { grade: '11', topics: ['CAE level grammar', 'Literature analysis', 'Research writing', 'Advanced listening', 'Public speaking'] },
      { grade: '12', topics: ['Exam preparation', 'Academic writing', 'Advanced reading', 'Fluency practice', 'B2/C1 certification'] },
    ]
  },
  {
    id: 'fizika',
    title: 'Physics',
    titleLt: 'Fizika',
    icon: Atom,
    grades: ['7','8','9','10','11','12'],
    description: 'Mechanics, thermodynamics, optics, electricity, and modern physics.',
    descriptionLt: 'Mechanika, termodinamika, optika, elektra ir šiuolaikinė fizika.',
    topics: [
      { grade: '7', topics: ['Kūnų judėjimas', 'Jėgos', 'Slėgis', 'Darbas ir energija', 'Šiluma'] },
      { grade: '8', topics: ['Elektros srovė', 'Magnetizmas', 'Šviesa', 'Garso bangos', 'Energijos tvermė'] },
      { grade: '9', topics: ['Kinematika', 'Dinamika', 'Gravitacija', 'Mechaniniai virpesiai', 'Termodinamika'] },
      { grade: '10', topics: ['Elektrostatika', 'Nuolatinė srovė', 'Elektromagnetizmas', 'Optika', 'Branduolinė fizika'] },
      { grade: '11', topics: ['Specialioji reliatyvumo teorija', 'Kvantinė fizika', 'Atomo fizika', 'Lazeriai', 'Kosmologija'] },
      { grade: '12', topics: ['Mechanikos uždaviniai', 'Elektros grandynės', 'Bangų optika', 'Šiuolaikinė fizika', 'Egzamino ruošimas'] },
    ]
  },
  {
    id: 'chemija',
    title: 'Chemistry',
    titleLt: 'Chemija',
    icon: Atom,
    grades: ['7','8','9','10','11','12'],
    description: 'Elements, compounds, reactions, organic and inorganic chemistry.',
    descriptionLt: 'Elementai, junginiai, reakcijos, organinė ir neorganinė chemija.',
    topics: [
      { grade: '7', topics: ['Medžiagos ir jų savybės', 'Atomo sandara', 'Periodinė lentelė', 'Cheminės reakcijos', 'Tirpalai'] },
      { grade: '8', topics: ['Oksidai', 'Rūgštys ir bazės', 'Druskos', 'Elektrolizė', 'Reakcijų greitis'] },
      { grade: '9', topics: ['Cheminė kinetika', 'Cheminė pusiausvyra', 'Elektrochemija', 'Metalai', 'Nemetalai'] },
      { grade: '10', topics: ['Organinė chemija', 'Angliavandeniliai', 'Alkoholiai', 'Rūgštys', 'Esteriai'] },
      { grade: '11', topics: ['Polimerai', 'Baltymiai', 'Angliavandeniai', 'Nukleorūgštys', 'Biochemija'] },
      { grade: '12', topics: ['Cheminė analizė', 'Pramoninė chemija', 'Aplinkos chemija', 'Laboratoriniai darbai', 'Egzamino ruošimas'] },
    ]
  },
  {
    id: 'biologija',
    title: 'Biology',
    titleLt: 'Biologija',
    icon: Leaf,
    grades: ['5','6','7','8','9','10','11','12'],
    description: 'Cell biology, ecology, genetics, human anatomy, and evolution.',
    descriptionLt: 'Ląstelių biologija, ekologija, genetika, žmogaus anatomija ir evoliucija.',
    topics: [
      { grade: '5', topics: ['Gyvoji gamta', 'Augalai', 'Gyvūnai', 'Žmogaus kūnas', 'Ekosistemos'] },
      { grade: '6', topics: ['Ląstelė', 'Fotosintezė', 'Stuburiniai gyvūnai', 'Mitybos grandinės', 'Aplinkos apsauga'] },
      { grade: '7', topics: ['Žmogaus organų sistemos', 'Kvėpavimas', 'Kraujotaka', 'Virškinimas', 'Nervų sistema'] },
      { grade: '8', topics: ['Genetika', 'Paveldimumas', 'Evoliucija', 'Mikrobiologija', 'Biotechnologijos'] },
      { grade: '9', topics: ['Ląstelės biologija', 'DNR ir RNR', 'Genetinė inžinerija', 'Ekologija', 'Bioįvairovė'] },
      { grade: '10', topics: ['Molekulinė biologija', 'Ląstelės dalijimasis', 'Genetikos uždaviniai', 'Žmogaus genetika', 'Populiacijų ekologija'] },
      { grade: '11', topics: ['Neurobiologija', 'Endokrininė sistema', 'Imunologija', 'Evoliucijos teorija', 'Bioetika'] },
      { grade: '12', topics: ['Šiuolaikinė genetika', 'Biotechnologijos', 'Aplinkos biologija', 'Sveikatos biologija', 'Egzamino ruošimas'] },
    ]
  },
  {
    id: 'istorija',
    title: 'History',
    titleLt: 'Istorija',
    icon: History,
    grades: ['5','6','7','8','9','10','11','12'],
    description: 'Lithuanian and world history from ancient times to modern era.',
    descriptionLt: 'Lietuvos ir pasaulio istorija nuo senovės iki šių dienų.',
    topics: [
      { grade: '5', topics: ['Priešistorė', 'Senovės civilizacijos', 'Senovės Graikija', 'Senovės Roma', 'Baltų gentys'] },
      { grade: '6', topics: ['Viduramžiai', 'Lietuvos valstybės kūrimasis', 'Mindaugas', 'Kryžiuočiai', 'Renesansas'] },
      { grade: '7', topics: ['Lietuvos Didžioji Kunigaikštystė', 'Reformacija', 'Abiejų Tautų Respublika', 'Apšvieta', 'Revoliucijos'] },
      { grade: '8', topics: ['XIX amžius', 'Tautinis atgimimas', 'Pirmasis pasaulinis karas', 'Nepriklausomybė 1918', 'Tarpukaris'] },
      { grade: '9', topics: ['Antrasis pasaulinis karas', 'Holokaustas', 'Sovietinė okupacija', 'Partizanai', 'Šaltasis karas'] },
      { grade: '10', topics: ['Sąjūdis', 'Nepriklausomybės atkūrimas', 'Europos integracija', 'Globalizacija', 'Šiuolaikinė Lietuva'] },
      { grade: '11', topics: ['Lyginamoji istorija', 'Politinės sistemos', 'Ekonomikos istorija', 'Kultūros istorija', 'Šaltinių analizė'] },
      { grade: '12', topics: ['Lietuvos istorijos sintezė', 'Pasaulio istorijos sintezė', 'Istoriografija', 'Tyrimai', 'Egzamino ruošimas'] },
    ]
  },
  {
    id: 'informatika',
    title: 'Computer Science',
    titleLt: 'Informatika',
    icon: Code,
    grades: ['5','6','7','8','9','10','11','12'],
    description: 'Programming, algorithms, digital literacy, and information technology.',
    descriptionLt: 'Programavimas, algoritmai, skaitmeninis raštingumas ir IT.',
    topics: [
      { grade: '5', topics: ['Kompiuterio sandara', 'Failų valdymas', 'Tekstų rengyklė', 'Interneto saugumas', 'Scratch pradmenys'] },
      { grade: '6', topics: ['Skaičiuoklės', 'Pateiktys', 'Scratch programavimas', 'Algoritminis mąstymas', 'Skaitmeninis pilietis'] },
      { grade: '7', topics: ['HTML ir CSS', 'Python pradmenys', 'Duomenų tipai', 'Ciklai', 'Sąlygos sakiniai'] },
      { grade: '8', topics: ['Python funkcijos', 'Masyvai', 'Algoritmų efektyvumas', 'Duomenų bazės', 'Kibernetinis saugumas'] },
      { grade: '9', topics: ['Objektinis programavimas', 'Duomenų struktūros', 'Rikiavimo algoritmai', 'Tinklo technologijos', 'Git'] },
      { grade: '10', topics: ['Programų kūrimo procesas', 'API naudojimas', 'Duomenų analizė', 'Dirbtinis intelektas', 'Projektinis darbas'] },
      { grade: '11', topics: ['Algoritmų sudėtingumas', 'Grafų teorija', 'Dinaminis programavimas', 'Kriptografija', 'Konkursinės užduotys'] },
      { grade: '12', topics: ['Sistemų projektavimas', 'Debesų kompiuterija', 'Mašininis mokymasis', 'IT projektai', 'Egzamino ruošimas'] },
    ]
  },
  {
    id: 'muzika',
    title: 'Music',
    titleLt: 'Muzika',
    icon: Music,
    grades: ['1','2','3','4','5','6','7','8','9','10'],
    description: 'Music theory, history, performance, and appreciation.',
    descriptionLt: 'Muzikos teorija, istorija, atlikimas ir supratimas.',
    topics: [
      { grade: '5', topics: ['Natos ir ritmas', 'Lietuvių liaudies dainos', 'Muzikos instrumentai', 'Dainavimas', 'Klausymas'] },
      { grade: '6', topics: ['Gamos ir tonacijos', 'Klasikinė muzika', 'Ansamblis', 'Muzikos stiliai', 'Kompozicija'] },
      { grade: '7', topics: ['Muzikos formos', 'Baroko muzika', 'Džiazas', 'Muzikos technologijos', 'Koncertai'] },
      { grade: '8', topics: ['Romantizmo muzika', 'Pop ir rok muzika', 'Muzikos industrija', 'Garso įrašymas', 'Kūryba'] },
    ]
  },
  {
    id: 'daile',
    title: 'Art',
    titleLt: 'Dailė',
    icon: Palette,
    grades: ['1','2','3','4','5','6','7','8','9','10'],
    description: 'Visual arts, art history, and creative expression.',
    descriptionLt: 'Vizualieji menai, meno istorija ir kūrybinė raiška.',
    topics: [
      { grade: '5', topics: ['Spalvos ir formos', 'Piešimas', 'Tapyba', 'Grafika', 'Lietuvių liaudies menas'] },
      { grade: '6', topics: ['Perspektyva', 'Portretas', 'Skulptūra', 'Dizainas', 'Meno epochos'] },
      { grade: '7', topics: ['Kompozicija', 'Abstraktusis menas', 'Fotografija', 'Skaitmeninis menas', 'Meno kritika'] },
      { grade: '8', topics: ['Šiuolaikinis menas', 'Instaliacija', 'Animacija', 'Portfolio kūrimas', 'Meno projektai'] },
    ]
  },
  {
    id: 'kuno-kultura',
    title: 'Physical Education',
    titleLt: 'Kūno kultūra',
    icon: Dumbbell,
    grades: ['1','2','3','4','5','6','7','8','9','10','11','12'],
    description: 'Sports, fitness, health, and physical activities.',
    descriptionLt: 'Sportas, fizinis aktyvumas, sveikata ir mankšta.',
    topics: [
      { grade: '5', topics: ['Lengvoji atletika', 'Krepšinis', 'Gimnastika', 'Plaukimas', 'Sveikata'] },
      { grade: '6', topics: ['Futbolas', 'Tinklinis', 'Orientavimosi sportas', 'Žiemos sportas', 'Fizinis pajėgumas'] },
    ]
  },
];

const CurriculumLearning = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const navigate = useNavigate();

  const filteredSubjects = curriculumSubjects.filter(subject => {
    const matchesSearch = subject.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          subject.titleLt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          subject.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === 'all' || subject.grades.includes(selectedGrade);
    const matchesSubject = selectedSubject === 'all' || subject.id === selectedSubject;
    return matchesSearch && matchesGrade && matchesSubject;
  });

  const getTopicsForGrade = (subject: CurriculumSubject, grade: string) => {
    return subject.topics.find(t => t.grade === grade)?.topics || [];
  };

  const handleStartTopic = (subjectId: string, subjectTitle: string, topic: string, grade: string) => {
    navigate(`/self-learning?subject=${subjectId}&topic=${encodeURIComponent(topic)}&grade=${grade}`);
  };

  return (
    <AppLayout title="Mokyklinis mokymas" subtitle="Lietuvos mokyklos programa pagal klases ir dalykus">
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Ieškoti dalykų, temų..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Klasė" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Visos klasės</SelectItem>
              {gradeGroups.map(group => (
                <div key={group.id}>
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">{group.label}</div>
                  {group.grades.map(g => (
                    <SelectItem key={g} value={g}>{g} klasė</SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Dalykas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Visi dalykai</SelectItem>
              {curriculumSubjects.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.titleLt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grade group tabs when no specific grade selected */}
        {selectedGrade === 'all' && (
          <Tabs defaultValue="middle" className="w-full">
            <TabsList className="grid grid-cols-4 w-full max-w-2xl">
              {gradeGroups.map(group => (
                <TabsTrigger key={group.id} value={group.id}>{group.label}</TabsTrigger>
              ))}
            </TabsList>
            {gradeGroups.map(group => (
              <TabsContent key={group.id} value={group.id}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                  {filteredSubjects
                    .filter(s => s.grades.some(g => group.grades.includes(g)))
                    .map(subject => {
                      const Icon = subject.icon;
                      const availableGrades = subject.grades.filter(g => group.grades.includes(g));
                      const topicsForFirstGrade = getTopicsForGrade(subject, availableGrades[0]);
                      
                      return (
                        <Card key={subject.id} className="border-border/40 hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <Icon className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-lg">{subject.titleLt}</CardTitle>
                                <CardDescription>{subject.title}</CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-3">{subject.descriptionLt}</p>
                            
                            <div className="flex flex-wrap gap-1 mb-3">
                              {availableGrades.map(g => (
                                <Badge key={g} variant="secondary" className="text-xs">{g} kl.</Badge>
                              ))}
                            </div>

                            {topicsForFirstGrade.length > 0 && (
                              <div className="space-y-1 mb-4">
                                <h4 className="font-medium text-xs text-muted-foreground">
                                  {availableGrades[0]} klasės temos:
                                </h4>
                                {topicsForFirstGrade.slice(0, 3).map((topic, i) => (
                                  <button
                                    key={i}
                                    onClick={() => handleStartTopic(subject.id, subject.titleLt, topic, availableGrades[0])}
                                    className="block w-full text-left text-xs py-1 px-2 rounded hover:bg-accent/50 transition-colors truncate"
                                  >
                                    • {topic}
                                  </button>
                                ))}
                                {topicsForFirstGrade.length > 3 && (
                                  <span className="text-xs text-muted-foreground pl-2">
                                    +{topicsForFirstGrade.length - 3} daugiau temų
                                  </span>
                                )}
                              </div>
                            )}

                            <Button
                              className="w-full"
                              variant="outline"
                              onClick={() => {
                                setSelectedSubject(subject.id);
                                setSelectedGrade(availableGrades[0]);
                              }}
                            >
                              <GraduationCap className="h-4 w-4 mr-2" />
                              Peržiūrėti programą
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}

        {/* When a specific grade is selected, show detailed topic view */}
        {selectedGrade !== 'all' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default" className="text-sm">{selectedGrade} klasė</Badge>
              <Button variant="ghost" size="sm" onClick={() => setSelectedGrade('all')}>
                ← Visos klasės
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredSubjects.map(subject => {
                const Icon = subject.icon;
                const topics = getTopicsForGrade(subject, selectedGrade);
                
                if (topics.length === 0) return null;

                return (
                  <Card key={subject.id} className="border-border/40">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{subject.titleLt}</CardTitle>
                          <CardDescription>{selectedGrade} klasė • {topics.length} temos</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {topics.map((topic, i) => (
                          <button
                            key={i}
                            onClick={() => handleStartTopic(subject.id, subject.titleLt, topic, selectedGrade)}
                            className="flex items-center justify-between w-full text-left text-sm py-2 px-3 rounded-lg hover:bg-accent/50 transition-colors border border-border/30"
                          >
                            <span className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                {i + 1}
                              </span>
                              {topic}
                            </span>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {filteredSubjects.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Dalykų nerasta</h3>
            <p className="text-muted-foreground">Pabandykite pakeisti paieškos filtrus</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CurriculumLearning;
