# stockcard

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.vscode-typescript-vue-plugin).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```


docker run -d --restart=always -p 8084:80 minorsoft/stockcardweb

CREATE TABLE public.sc_doc_movement
(
  roworder serial,
  doc_no character varying(255),
  cust_code character varying(255),
  item_code character varying(255),
  item_name character varying(255),
  remark character varying(255),
  item_brand character varying(255),
  unit_code character varying(255),
  qty_inc numeric DEFAULT 0,
  qty_minus numeric DEFAULT 0,
  creator_code character varying(255),
  create_datetime timestamp without time zone DEFAULT now(),
  movement character varying(10),
  doc_date date,
  is_manual smallint NOT NULL DEFAULT 0,
  CONSTRAINT sc_doc_movement_pk PRIMARY KEY (roworder)
)

CREATE TABLE public.sc_permission
(
  roworder serial,
  user_code character varying(255) NOT NULL,
  status_list smallint NOT NULL DEFAULT 0,
  warehouse_list smallint NOT NULL DEFAULT 0,
  user_permission smallint NOT NULL DEFAULT 0,
  create_datetime timestamp without time zone DEFAULT timezone('asia/bangkok'::text, now()),
  report_list smallint NOT NULL DEFAULT 0,
  CONSTRAINT sc_permission_pkey PRIMARY KEY (user_code)
)



CREATE TABLE public.sc_user_brand
(
  roworder serial,
  user_code character varying(255) NOT NULL,
  brand_list text,
  create_datetime timestamp without time zone DEFAULT now(),
  CONSTRAINT sc_brand_list_pk PRIMARY KEY (user_code)
)