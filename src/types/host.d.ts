// Declaraciones de tipos para los módulos del host
declare module 'host/SharedStore' {
  export * from '@/app/store/sharedStore'
}

declare module 'host/SharedHooks' {
  export * from '@/hooks/useSharedStore'
}

declare module 'host/SidebarToggle' {
  export * from '@/hooks/useSidebarToggle'
}
