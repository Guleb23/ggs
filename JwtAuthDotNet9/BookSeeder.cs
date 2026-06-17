using booksa.Models;
using booksa.Services.BooksService;

namespace booksa
{
    public class BookSeeder
    {
        private readonly IBookService _bookService;
        private readonly ILogger<BookSeeder> _logger;

        public BookSeeder(IBookService bookService, ILogger<BookSeeder> logger)
        {
            _bookService = bookService;
            _logger = logger;
        }

        public async Task SeedInitialBooksAsync()
        {
            try
            {
                var existingBooks = await _bookService.GetAllBooksAsync();
                if (existingBooks.Any())
                {
                    _logger.LogInformation("База данных уже содержит книги. Пропускаем начальное наполнение.");
                    return;
                }
            }
            catch
            {
                // Таблица ещё пуста — продолжаем
            }

            _logger.LogInformation("Начинаем заполнение базы 50+ книгами...");

            int saved = 0;
            foreach (var bookDto in GetSeedBooks())
            {
                try
                {
                    await _bookService.AddOrGetBookAsync(bookDto);
                    saved++;
                    if (saved % 10 == 0)
                        _logger.LogInformation("Сохранено {Count}/60 книг...", saved);
                    await Task.Delay(30);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Ошибка при сохранении: {Title}", bookDto.Title);
                }
            }

            _logger.LogInformation("Наполнение завершено. Сохранено {Count} книг.", saved);
        }

        private static List<BookDto> GetSeedBooks()
        {
            return new List<BookDto>
            {
                new() { Title = "Война и мир", Author = "Лев Толстой", CoverUrl = "https://covers.openlibrary.org/b/id/12519893-M.jpg", Description = "Эпический роман о русском обществе времен наполеоновских войн, переплетение судеб дворянских семей на фоне исторических событий.", Isbn = "978-5-17-091736-1" },
                new() { Title = "Преступление и наказание", Author = "Фёдор Достоевский", CoverUrl = "https://covers.openlibrary.org/b/id/12648756-M.jpg", Description = "Молодой студент Раскольников совершает убийство и пытается найти оправдание своему поступку, погружаясь в пучину моральных терзаний.", Isbn = "978-5-04-107592-3" },
                new() { Title = "1984", Author = "Джордж Оруэлл", CoverUrl = "https://covers.openlibrary.org/b/id/12649567-M.jpg", Description = "Тоталитарное общество будущего, где Большой Брат следит за каждым шагом, а история переписывается каждый день." },
                new() { Title = "Маленький принц", Author = "Антуан де Сент-Экзюпери", CoverUrl = "https://covers.openlibrary.org/b/id/12621578-M.jpg", Description = "Философская сказка о маленьком мальчике с астероида, который учит взрослых смотреть на мир сердцем." },
                new() { Title = "Гарри Поттер и философский камень", Author = "Дж.К. Роулинг", CoverUrl = "https://covers.openlibrary.org/b/id/12604864-M.jpg", Description = "Мальчик, выживший после нападения тёмного волшебника, поступает в школу чародейства и волшебства Хогвартс." },
                new() { Title = "Убить пересмешника", Author = "Харпер Ли", CoverUrl = "https://covers.openlibrary.org/b/id/12633759-M.jpg", Description = "История о расовой несправедливости на американском юге глазами маленькой девочки." },
                new() { Title = "Гордость и предубеждение", Author = "Джейн Остин", CoverUrl = "https://covers.openlibrary.org/b/id/12626278-M.jpg", Description = "Остроумная история любви Элизабет Беннет и мистера Дарси в аристократической Англии XVIII века." },
                new() { Title = "Мастер и Маргарита", Author = "Михаил Булгаков", CoverUrl = "https://covers.openlibrary.org/b/id/12634890-M.jpg", Description = "Дьявол прибывает в Москву 1930-х годов, переворачивая жизнь города и рассказывая историю Понтия Пилата." },
                new() { Title = "Анна Каренина", Author = "Лев Толстой", CoverUrl = "https://covers.openlibrary.org/b/id/12615903-M.jpg", Description = "Трагическая история любви замужней женщины в высшем обществе Санкт-Петербурга XIX века." },
                new() { Title = "Три товарища", Author = "Эрих Мария Ремарк", CoverUrl = "https://covers.openlibrary.org/b/id/12624987-M.jpg", Description = "Трое друзей-фронтовиков пытаются найти смысл жизни в послевоенной Германии." },
                new() { Title = "Над пропастью во ржи", Author = "Джером Сэлинджер", CoverUrl = "https://covers.openlibrary.org/b/id/12627965-M.jpg", Description = "Подросток Холден Колфилд скитается по Нью-Йорку, размышляя о фальши взрослого мира." },
                new() { Title = "Великий Гэтсби", Author = "Фрэнсис Скотт Фицджеральд", CoverUrl = "https://covers.openlibrary.org/b/id/12610584-M.jpg", Description = "История о богатстве, любви и американской мечте на фоне «ревущих двадцатых»." },
                new() { Title = "Сто лет одиночества", Author = "Габриэль Гарсиа Маркес", CoverUrl = "https://covers.openlibrary.org/b/id/12623041-M.jpg", Description = "Сага о семье Буэндиа в вымышленном городе Макондо, где реальность переплетается с магией." },
                new() { Title = "Портрет Дориана Грея", Author = "Оскар Уайльд", CoverUrl = "https://covers.openlibrary.org/b/id/12629273-M.jpg", Description = "Красивый юноша остаётся вечно молодым, в то время как его портрет стареет и отражает все пороки." },
                new() { Title = "Джейн Эйр", Author = "Шарлотта Бронте", CoverUrl = "https://covers.openlibrary.org/b/id/12618762-M.jpg", Description = "Сирота становится гувернанткой и находит любовь в мрачном поместье Торнфилд." },
                new() { Title = "451° по Фаренгейту", Author = "Рэй Брэдбери", CoverUrl = "https://covers.openlibrary.org/b/id/12630895-M.jpg", Description = "В тоталитарном будущем пожарные сжигают книги, но один из них начинает сомневаться в правильности системы." },
                new() { Title = "Шерлок Холмс. Этюд в багровых тонах", Author = "Артур Конан Дойл", CoverUrl = "https://covers.openlibrary.org/b/id/12616574-M.jpg", Description = "Первое появление великого детектива Шерлока Холмса и доктора Ватсона." },
                new() { Title = "О дивный новый мир", Author = "Олдос Хаксли", CoverUrl = "https://covers.openlibrary.org/b/id/12625419-M.jpg", Description = "Антиутопия о мире генетического программирования, потребления и полного контроля над эмоциями." },
                new() { Title = "Ромео и Джульетта", Author = "Уильям Шекспир", CoverUrl = "https://covers.openlibrary.org/b/id/12622134-M.jpg", Description = "Трагическая история любви двух юных сердец из враждующих семей Вероны." },
                new() { Title = "Мёртвые души", Author = "Николай Гоголь", CoverUrl = "https://covers.openlibrary.org/b/id/12633812-M.jpg", Description = "Авантюрист Чичиков путешествует по России, скупая «мёртвые души» крестьян." },
                new() { Title = "Алиса в Стране чудес", Author = "Льюис Кэрролл", CoverUrl = "https://covers.openlibrary.org/b/id/12619538-M.jpg", Description = "Девочка проваливается в кроличью нору и попадает в мир абсурда и фантазии." },
                new() { Title = "Скотный двор", Author = "Джордж Оруэлл", CoverUrl = "https://covers.openlibrary.org/b/id/12628451-M.jpg", Description = "Сатирическая притча о животных, которые свергают людей, но сами становятся тиранами." },
                new() { Title = "Три сестры", Author = "Антон Чехов", CoverUrl = "https://covers.openlibrary.org/b/id/12615063-M.jpg", Description = "Пьеса о трёх сёстрах, мечтающих уехать в Москву и найти смысл в провинциальной жизни." },
                new() { Title = "Отцы и дети", Author = "Иван Тургенев", CoverUrl = "https://covers.openlibrary.org/b/id/12630987-M.jpg", Description = "Конфликт поколений между либералами-дворянами и нигилистами-разночинцами." },
                new() { Title = "Герой нашего времени", Author = "Михаил Лермонтов", CoverUrl = "https://covers.openlibrary.org/b/id/12617349-M.jpg", Description = "Психологический роман о разочарованном офицере Печорине на Кавказе." },
                new() { Title = "Властелин колец: Братство кольца", Author = "Дж.Р.Р. Толкин", CoverUrl = "https://covers.openlibrary.org/b/id/12632567-M.jpg", Description = "Хоббит Фродо отправляется в опасное путешествие, чтобы уничтожить Кольцо Всевластья." },
                new() { Title = "Тихий Дон", Author = "Михаил Шолохов", CoverUrl = "https://covers.openlibrary.org/b/id/12619823-M.jpg", Description = "Эпопея о жизни донского казачества в эпоху Первой мировой и Гражданской войны." },
                new() { Title = "Доктор Живаго", Author = "Борис Пастернак", CoverUrl = "https://covers.openlibrary.org/b/id/12627456-M.jpg", Description = "История любви и жизни врача и поэта на фоне революции и гражданской войны." },
                new() { Title = "Хоббит, или Туда и обратно", Author = "Дж.Р.Р. Толкин", CoverUrl = "https://covers.openlibrary.org/b/id/12611293-M.jpg", Description = "Хоббит Бильбо отправляется в приключение с гномами, чтобы отвоевать сокровища у дракона." },
                new() { Title = "Грозовой перевал", Author = "Эмили Бронте", CoverUrl = "https://covers.openlibrary.org/b/id/12624178-M.jpg", Description = "Бурная и разрушительная история любви Хитклиффа и Кэтрин на вересковых пустошах Йоркшира." },
                new() { Title = "Бесы", Author = "Фёдор Достоевский", CoverUrl = "https://covers.openlibrary.org/b/id/12626543-M.jpg", Description = "Политический роман о революционерах и нигилистах, готовых разрушить общество ради идеи." },
                new() { Title = "Евгений Онегин", Author = "Александр Пушкин", CoverUrl = "https://covers.openlibrary.org/b/id/12621347-M.jpg", Description = "Роман в стихах о разочарованном дворянине и трагической любви Татьяны Лариной." },
                new() { Title = "Братья Карамазовы", Author = "Фёдор Достоевский", CoverUrl = "https://covers.openlibrary.org/b/id/12630129-M.jpg", Description = "Философский роман о вере, сомнении и отцеубийстве в семье Карамазовых." },
                new() { Title = "Ревизор", Author = "Николай Гоголь", CoverUrl = "https://covers.openlibrary.org/b/id/12615309-M.jpg", Description = "Комедия о чиновниках уездного города, которые принимают мелкого проходимца за ревизора." },
                new() { Title = "Пикник на обочине", Author = "Аркадий и Борис Стругацкие", CoverUrl = "https://covers.openlibrary.org/b/id/12627931-M.jpg", Description = "После посещения инопланетян на Земле остаются Зоны с аномалиями и артефактами." },
                new() { Title = "Марсианские хроники", Author = "Рэй Брэдбери", CoverUrl = "https://covers.openlibrary.org/b/id/12623741-M.jpg", Description = "Цикл рассказов о колонизации Марса и столкновении человеческой цивилизации с марсианской." },
                new() { Title = "Дюна", Author = "Фрэнк Герберт", CoverUrl = "https://covers.openlibrary.org/b/id/12631568-M.jpg", Description = "Эпическая сага о пустынной планете Арракис, пряности и борьбе за контроль над галактикой." },
                new() { Title = "Тарас Бульба", Author = "Николай Гоголь", CoverUrl = "https://covers.openlibrary.org/b/id/12618091-M.jpg", Description = "Историческая повесть о запорожских казаках, войне с поляками и трагической судьбе семьи Бульбы." },
                new() { Title = "Обломов", Author = "Иван Гончаров", CoverUrl = "https://covers.openlibrary.org/b/id/12629504-M.jpg", Description = "Роман о помещике, который большую часть жизни проводит лёжа на диване в своих мечтах." },
                new() { Title = "Чевенгур", Author = "Андрей Платонов", CoverUrl = "https://covers.openlibrary.org/b/id/12612857-M.jpg", Description = "Философский роман о строительстве коммунизма в вымышленном городе." },
                new() { Title = "Собачье сердце", Author = "Михаил Булгаков", CoverUrl = "https://covers.openlibrary.org/b/id/12633276-M.jpg", Description = "Профессор Преображенский превращает собаку в человека — с непредсказуемыми последствиями." },
                new() { Title = "Трудно быть богом", Author = "Аркадий и Борис Стругацкие", CoverUrl = "https://covers.openlibrary.org/b/id/12620415-M.jpg", Description = "Землянин-наблюдатель на отсталой планете не имеет права вмешиваться, но не может оставаться в стороне." },
                new() { Title = "Вишнёвый сад", Author = "Антон Чехов", CoverUrl = "https://covers.openlibrary.org/b/id/12627088-M.jpg", Description = "Пьеса о дворянской семье, теряющей родовое имение с вишнёвым садом." },
                new() { Title = "Золотой телёнок", Author = "Илья Ильф, Евгений Петров", CoverUrl = "https://covers.openlibrary.org/b/id/12614842-M.jpg", Description = "Приключения великого комбинатора Остапа Бендера в погоне за миллионом." },
                new() { Title = "Двенадцать стульев", Author = "Илья Ильф, Евгений Петров", CoverUrl = "https://covers.openlibrary.org/b/id/12632154-M.jpg", Description = "Остап Бендер ищет бриллианты, спрятанные в одном из двенадцати стульев." },
                new() { Title = "Завтра была война", Author = "Борис Васильев", CoverUrl = "https://covers.openlibrary.org/b/id/12616022-M.jpg", Description = "Повесть о выпускниках школы 1941 года, которым завтра предстоит уйти на фронт." },
                new() { Title = "А зори здесь тихие", Author = "Борис Васильев", CoverUrl = "https://covers.openlibrary.org/b/id/12626897-M.jpg", Description = "Пять девушек-зенитчиц вступают в неравный бой с немецкими диверсантами." },
                new() { Title = "Generation П", Author = "Виктор Пелевин", CoverUrl = "https://covers.openlibrary.org/b/id/12613978-M.jpg", Description = "Роман о рекламе, наркотиках и постсоветской реальности в России 1990-х." },
                new() { Title = "Чапаев и Пустота", Author = "Виктор Пелевин", CoverUrl = "https://covers.openlibrary.org/b/id/12628863-M.jpg", Description = "Мистический роман, в котором буддийский монах оказывается в России времён Гражданской войны." },
                new() { Title = "Норвежский лес", Author = "Харуки Мураками", CoverUrl = "https://covers.openlibrary.org/b/id/12620839-M.jpg", Description = "Ностальгическая история любви, памяти и потери в Японии 1960-х годов." },
                new() { Title = "Цветы для Элджернона", Author = "Дэниел Киз", CoverUrl = "https://covers.openlibrary.org/b/id/12634251-M.jpg", Description = "Умственно отсталый Чарли становится гением после экспериментальной операции." },
                new() { Title = "Солярис", Author = "Станислав Лем", CoverUrl = "https://covers.openlibrary.org/b/id/12611684-M.jpg", Description = "Научно-фантастический роман о контакте с разумным океаном на планете Солярис." },
                new() { Title = "Колыбель для кошки", Author = "Курт Воннегут", CoverUrl = "https://covers.openlibrary.org/b/id/12629433-M.jpg", Description = "Сатирический роман об учёных, религии и веществе, которое может заморозить всю Землю." },
                new() { Title = "На Западном фронте без перемен", Author = "Эрих Мария Ремарк", CoverUrl = "https://covers.openlibrary.org/b/id/12625761-M.jpg", Description = "Окопная правда Первой мировой войны глазами молодого немецкого солдата." },
                new() { Title = "Улисс", Author = "Джеймс Джойс", CoverUrl = "https://covers.openlibrary.org/b/id/12613241-M.jpg", Description = "Модернистский роман, описывающий один день в жизни дублинца Леопольда Блума." },
                new() { Title = "Моби Дик", Author = "Герман Мелвилл", CoverUrl = "https://covers.openlibrary.org/b/id/12624763-M.jpg", Description = "Эпическая история капитана Ахава, одержимого охотой на белого кита." },
                new() { Title = "451 градус по Фаренгейту", Author = "Рэй Брэдбери", CoverUrl = "https://covers.openlibrary.org/b/id/12630682-M.jpg", Description = "В мире, где книги запрещены, пожарный начинает читать и задавать вопросы." },
                new() { Title = "Приключения Шерлока Холмса", Author = "Артур Конан Дойл", CoverUrl = "https://covers.openlibrary.org/b/id/12617126-M.jpg", Description = "Сборник рассказов о величайшем детективе всех времён и его верном помощнике." },
                new() { Title = "Остров сокровищ", Author = "Роберт Льюис Стивенсон", CoverUrl = "https://covers.openlibrary.org/b/id/12622456-M.jpg", Description = "Мальчик Джим находит карту пиратского клада и отправляется в опасное плавание." },
            };
        }
    }
}