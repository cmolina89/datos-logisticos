// src/types/menu.ts

export interface MenuOptionModel {
  url?: string
  name?: string
  icon?: string
  title?: string
  children?: MenuGroupModel[]
}

export interface MenuGroupModel {
  title: string
  menu: MenuOptionModel[]
}

export interface SelectedOptions {
  [deep: number]: MenuOptionModel
}
