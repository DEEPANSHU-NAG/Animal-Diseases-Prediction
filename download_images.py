from icrawler.builtin import BingImageCrawler

# Fever
crawler = BingImageCrawler(storage={'root_dir': 'dataset/Fever'})
crawler.crawl(keyword='animal fever symptoms', max_num=50)

# Skin Infection
crawler = BingImageCrawler(storage={'root_dir': 'dataset/Skin_Infection'})
crawler.crawl(keyword='animal skin infection', max_num=50)

# Healthy
crawler = BingImageCrawler(storage={'root_dir': 'dataset/Healthy'})
crawler.crawl(keyword='healthy animals', max_num=50)

# Injury
crawler = BingImageCrawler(storage={'root_dir': 'dataset/Injury'})
crawler.crawl(keyword='animal injury wound', max_num=50)

print("✅ Images downloaded successfully!")