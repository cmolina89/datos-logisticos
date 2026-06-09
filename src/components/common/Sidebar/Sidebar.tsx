import {
    closeSidebarAtom,
    closeSubmenuAtom,
    menuItemsAtom,
    selectedOptionsAtom,
    selectOptionAtom,
    sidebarOpenAtom
} from '@/app/store/sidebarAtoms';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { menuService } from '@/services/menuService';
import type { MenuOptionModel } from '@/types/menu';
import { Link } from '@modern-js/runtime/router';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import './Sidebar.scss';
import SidebarOption from './SidebarOption';

export default function Sidebar() {
    const [menuItems, setMenuItems] = useAtom(menuItemsAtom);
    const selectedOptions = useAtomValue(selectedOptionsAtom);
    const sidebarOpen = useAtomValue(sidebarOpenAtom);
    const closeSidebar = useSetAtom(closeSidebarAtom);
    const closeSubmenu = useSetAtom(closeSubmenuAtom);
    const selectOption = useSetAtom(selectOptionAtom);

    const { isMdDown } = useBreakpoint();
    const isHandset = isMdDown;

    // Cargar datos del menú desde el servicio
    useEffect(() => {
        const loadMenuData = async () => {
            try {
                const data = await menuService.fetchSidebarMenu();
                setMenuItems(data);
            } catch (error) {
                console.error('Error loading menu data:', error);
                setMenuItems([]);
            }
        };

        loadMenuData();
    }, [setMenuItems]);

    const handleSelectOption = (selectedOption: MenuOptionModel, deep: number) => {
        selectOption({ option: selectedOption, deep });
    };

    const resetSidebar = () => {
        if (isHandset) {
            closeSidebar();
        } else {
            closeSubmenu();
        }
    };

    const sidebarClasses = [
        'sidebar-base',
        (!isHandset || sidebarOpen) && 'sidebar-visible',
        (sidebarOpen || selectedOptions[1]) && 'sidebar-expanded',
        selectedOptions[1] && 'submenu-visible'
    ]
        .filter(Boolean)
        .join(' ');

    if (process.env.NODE_ENV === 'development') {
        console.log('Sidebar render:', {
            sidebarOpen,
            isHandset,
            menuItems: menuItems?.length,
            sidebarClasses,
            selectedOptions
        });
    }

    if (!menuItems) {
        return (
            <nav id="clt-sidebar" className={`sidebar-base ${!isHandset ? 'sidebar-visible' : ''}`}>
                <article id="sidenav">
                    <div
                        style={{
                            padding: '20px',
                            textAlign: 'center',
                            color: 'var(--color-text-soft, #666)'
                        }}
                    >
                        Cargando...
                    </div>
                </article>
            </nav>
        );
    }

    return (
        <nav id="clt-sidebar" className={sidebarClasses}>
            {/* SIDEBAR ICON MENU */}
            <article id="sidenav">
                {menuItems.map((option) => (
                    // S6479 fix: se usa option.url o option.name como key estable en lugar de index
                    <SidebarOption
                        key={option.url || option.name}
                        item={option}
                        selectedItem={selectedOptions[1]}
                        onSelected={(item) => handleSelectOption(item, 1)}
                    />
                ))}
            </article>

            {/* SIDEBAR FULL SUBMENU */}
            {selectedOptions[1] && selectedOptions[1].children && (
                <>
                    <section id="submenu">
                        <header>
                            <h4 className="cl-subheader-1">{selectedOptions[1].name}</h4>
                            <button type="button" cl-icon-button-flat="" onClick={resetSidebar}>
                                <span className="clt clt-close"></span>
                            </button>
                        </header>
                        <article>
                            {selectedOptions[1].children.map((optionGroup) => (
                                // S6479 fix: se usa optionGroup.title como key estable
                                <dl key={optionGroup.title}>
                                    <dt className="cl-body">{optionGroup.title}</dt>
                                    {optionGroup.menu.map((option) => (
                                        <div key={option.url || option.name}>
                                            <SidebarOption
                                                item={option}
                                                selectedItem={selectedOptions[2]}
                                                onSelected={(item) => handleSelectOption(item, 2)}
                                            />

                                            {option.children &&
                                                option.children.map((subGroup) => (
                                                    <dd key={subGroup.title || subGroup.menu?.[0]?.name}>
                                                        {subGroup.menu.map((subOption) => (
                                                            <Link
                                                                key={subOption.url || subOption.name}
                                                                className="cl-small"
                                                                to={subOption.url || '#'}
                                                            >
                                                                <div>{subOption.name}</div>
                                                            </Link>
                                                        ))}
                                                    </dd>
                                                ))}
                                        </div>
                                    ))}
                                </dl>
                            ))}
                        </article>
                    </section>
                </>
            )}
        </nav>
    );
}
