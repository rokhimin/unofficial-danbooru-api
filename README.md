#ReadMe

### About
Unofficial danbooru API host in githubpages

https://rokhimin.github.io/unofficial-danbooru-api

### tech use
- Jekyll
- Javascript
- Bulma css 

### Usage

##### Get tags

```
https://whdzera.site/unofficial-danbooru-api/api?tags={name tag}
```

example, I want to search tag armpits

```
https://whdzera.site/unofficial-danbooru-api/api?tags=armpits
```
output
```
{
  "tag": "armpits",
  "page": 1,
  "count": 19,
  "pagination": {
    "current_page": 1
  },
  "posts": [
    {
      "id": "8984674",
      "title": "flora and trina (goddess of victory: nikke) drawn by young999999990",
      "artist": "young999999990",
      "image_url": "https://cdn.donmai.us/360x360/07/32/0732128dd2e73ff17018ae27196efa4c.jpg",
      "sample_image": "https://cdn.donmai.us/sample/07/32/__flora_and_trina_goddess_of_victory_nikke_drawn_by_young999999990__sample-0732128dd2e73ff17018ae27196efa4c.jpg",
      "original_image": "https://cdn.donmai.us/original/07/32/__flora_and_trina_goddess_of_victory_nikke_drawn_by_young999999990__0732128dd2e73ff17018ae27196efa4c.jpg",
      "page_url": "https://danbooru.donmai.us/posts/8984674",
      "published": "",
      "updated": "2025-03-12T10:19:26Z",
      "tags": [
        "armpits"
      ]
    },......
```

if you want to search 2 tags, example armpits and ass (max 2 tags)

```
https://whdzera.site/unofficial-danbooru-api/api?tags=armpits+ass
```

##### Get pages

```
https://whdzera.site/unofficial-danbooru-api/api?tags={name tag}&{number page}
```

example, I want to search tag armpits and page 2
```
https://whdzera.site/unofficial-danbooru-api/api?tags=armpits&2
```

##### Get posts 

```
https://whdzera.site/unofficial-danbooru-api/api/posts?id={number id}
```

output
```
{
  "id": 8984674,
  "created_at": "2025-03-12T06:19:26.600-04:00",
  "uploader_id": 1182530,
  "score": 6,
  "source": "https://twitter.com/young999999990/status/1899733450980307003",
  "md5": "0732128dd2e73ff17018ae27196efa4c",
  "last_comment_bumped_at": null,
  "rating": "q",
  "image_width": 3584,
  "image_height": 4096,
  "tag_string": "2girls :o absurdres animal_on_head armpits bird bird_on_head blue_hair blush breasts commentary completely_nude convenient_censoring dress flora_(nikke) gloves goddess_of_victory:_nikke highres huge_breasts leaf leaf_censor long_hair medium_breasts medium_hair mole mole_under_mouth multiple_girls navel nude on_head open_mouth purple_eyes purple_hair smile stomach trina_(nikke) very_long_hair white_background white_dress white_gloves young999999990",
  ............
```

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/rokhimin/unofficial-danbooru-api/. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Contributor Covenant](https://www.contributor-covenant.org/) code of conduct.

## Development

To set up your environment, run `bundle install`.

Your setup just like a normal Jekyll site! To test your theme, run `bundle exec jekyll serve` and open your browser at `http://localhost:4000`. This starts a Jekyll server using your theme. Add pages, documents, data, etc. like normal to test contents. As you make modifications to your content, your site will regenerate and you should see the changes in the browser after a refresh, just like normal.

## License

is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
