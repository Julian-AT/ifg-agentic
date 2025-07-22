import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# --- Enterprise Data Loading and Validation ---

def load_validate_data(url):
    """
    Loads and validates the Donauinsel Freizeiteinrichtungen Punkte dataset.
    Performs key data quality checks and prepares latitude/longitude columns.
    """
    try:
        df = pd.read_csv(url)
        print(f"✅ Erfolgreich geladen: {len(df)} Zeilen, {len(df.columns)} Spalten.")
        print(f"👀 Spalten: {list(df.columns)}")
    except Exception as e:
        print(f"❌ Fehler beim Laden der Daten: {e}")
        raise
    # Datenqualitätsprüfung
    print("🔍 Datenqualitätsprüfung ...")
    print(f"• Fehlende Werte insgesamt: {df.isnull().sum().sum()}")
    print(f"• Doppelte Zeilen: {df.duplicated().sum()}")
    print("• Spaltentypen:")
    print(df.dtypes)
    # Extrahiere Längen- und Breitengrad aus SHAPE
    try:
        coords = df['SHAPE'].str.extract(r'\(?([0-9\.-]+) ([0-9\.-]+)\)?')
        df['LON'] = coords[0].astype(float)
        df['LAT'] = coords[1].astype(float)
        print("🗺️  Koordinaten extrahiert.")
    except Exception as e:
        print(f"❌ Fehler beim Extrahieren der Koordinaten: {e}")
        raise
    # Prüfe, dass alle Koordinaten gültig sind
    if df['LAT'].isnull().any() or df['LON'].isnull().any():
        print(f"⚠️  Es sind ungültige Koordinaten vorhanden (NaN).")
    return df

# --- Visualisierung: Karte der Freizeiteinrichtungen Donauinsel ---

def plot_donauinsel_freizeiteinrichtungen(df):
    """
    Zeigt die Standorte der Freizeiteinrichtungen auf der Donauinsel als Streudiagramm.
    Farblich nach Typ (TYP_TXT oder TYP, falls leer).
    """
    # Farbzuordnung nach Kategorie
    grouping = 'TYP_TXT' if df['TYP_TXT'].nunique() > 1 else 'TYP'
    categories = df[grouping].fillna('Unbekannt').unique()
    # Define color palette
    colors = plt.get_cmap('tab20', len(categories))
    color_map = {cat: colors(i) for i, cat in enumerate(categories)}
    
    fig, ax = plt.subplots(figsize=(12, 7))
    # Plot each category
    for cat in categories:
        sub = df[df[grouping]==cat]
        ax.scatter(sub['LON'], sub['LAT'], label=str(cat), s=50, alpha=0.7, color=color_map[cat], edgecolor='k')
    ax.set_title('Karte der Freizeiteinrichtungen Donauinsel', fontsize=16)
    ax.set_xlabel('Längengrad (Lon)', fontsize=12)
    ax.set_ylabel('Breitengrad (Lat)', fontsize=12)
    ax.grid(True, linestyle=':', linewidth=0.5)
    ax.legend(title='Kategorie', bbox_to_anchor=(1.01, 1), loc='upper left')
    plt.tight_layout()
    plt.show()

if __name__ == "__main__":
    DATA_URL = "https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:DONAUINSPKTOGD&srsName=EPSG:4326&outputFormat=csv"
    df = load_validate_data(DATA_URL)
    plot_donauinsel_freizeiteinrichtungen(df)
    # Zusätzliche Analyse-Ideen (optional):
    # - Häufigkeiten nach TYP_TXT anzeigen
    # - Heatmap der Einrichtungen
    # - Verteilung der Arten (Balkendiagramm)